import { read } from "../../../src/modules/http/controllers/healthcheckController";
import * as appHealth from "../../../src/app/appHealth";
import { HealthStatus } from "../../../src/constants";

jest.mock('../../../src/app/appHealth');


const mockRequest: any = {
    path: '/healthcheck',
};

const mockResponse: any = {
    status: jest.fn(() => {
        return { send: jest.fn() };
    }),
};


describe('Healthcheck Controller', () => {
    describe('Read function', () => {
        it('Should be defined and return 200 if getHealth returns pass', () => {
            jest.spyOn(appHealth, 'getHealth').mockImplementation((): any => {
                return {
                    status: HealthStatus.Pass
                };
            });

            read(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenLastCalledWith(200);
        });

        it('Should be defined and return 200 if getHealth returns warn', () => {
            jest.spyOn(appHealth, 'getHealth').mockImplementation((): any => {
                return {
                    status: HealthStatus.Warn
                };
            });


            read(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenLastCalledWith(200);
        });

        it('Should be defined and return 500 if getHealth returns fail', () => {
            jest.spyOn(appHealth, 'getHealth').mockImplementation((): any => {
                return {
                    status: HealthStatus.Fail
                };
            });

            read(mockRequest, mockResponse);
            expect(mockResponse.status).toHaveBeenLastCalledWith(500);
        });
    });
});
