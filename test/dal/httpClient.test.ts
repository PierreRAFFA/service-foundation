import { IDalErrorResponse } from "../../src/interfaces";
import { get } from "lodash";

const axiosSpy = jest.fn();
jest.mock('axios', () => {
    return {
        default: axiosSpy
    }
});

const errorLogSpy = jest.fn();
jest.mock('../../src/utils/logger', () => {
    return {
        default: {
            error: errorLogSpy,
            silly: jest.fn(),
        }
    }
});

import { formatError, request } from "../../src/dal/httpClient";

describe('httpClient', () => {
    describe('When a baseUrl is set', () => {
        it('it should call axios', () => {
            axiosSpy.mockResolvedValue({});
            request({
                baseURL: 'url'
            });

            expect(axiosSpy).toHaveBeenCalled();
        });
    });

    describe('When a baseUrl is NOT set', () => {
        it('it should NOT call axios', () => {
            axiosSpy.mockReset();
            request({
                baseURL: undefined
            });

            expect(axiosSpy).not.toHaveBeenCalled();
        });
        it('it should log', () => {
            axiosSpy.mockReset();
            request({
                baseURL: undefined,
                headers: {
                    'auth-key': 'my_key'
                }
            });

            expect(errorLogSpy).toHaveBeenCalledWith(new Error('Could not make the http request. Please configure this microservice with app.registerMicroservice() - {"headers":{"auth-key":"**********"}}'));
        });
    });

    describe('When axios call throws an exception', () => {
        it('it should throw an exception containing the status code', async () => {
            axiosSpy.mockReset();
            axiosSpy.mockRejectedValueOnce(undefined);

            expect(request({
                baseURL: 'url'
            })).rejects.toThrow();
        });
    });

    describe('When an error is formatted', () => {
        it('it should return the formatted error', async () => {
            const error: Error = new Error('error from axios');

            axiosSpy.mockReset();
            axiosSpy.mockRejectedValueOnce(error);

            const response: IDalErrorResponse = {
                response: {
                    status: '404',
                    data: {
                        message: '',
                        status_code: 'Not Found',
                    },
                    statusText: 'Not Found'
                }
            };

            const output: Error = formatError(response);

            expect(output.message).toBe('Not Found');
            expect(get(output, 'statusCode')).toBe('404');
        });
    });

});
