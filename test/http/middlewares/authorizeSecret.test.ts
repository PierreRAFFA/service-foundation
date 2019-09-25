import authorizeSecret from "../../../src/modules/http/middlewares/authorizeSecret";
import { httpConfig } from "../../../src/modules/http/config";

const mockRequest: any = {
    path: '/test',
    headers: {
        'auth-key': 'MyAuthKey'
    }
};
const mockResponse: any = {
    status: jest.fn(() => {
        return { send: jest.fn() };
    }),
};
const mockNext = jest.fn();


describe("Authentication middleware", () => {
    beforeAll(() => {
        jest.resetModules();
    });

    it("Should let the request go to the next middleware if the header auth-key is correct", () => {
        httpConfig.authKey = "MyAuthKey";
        const result = authorizeSecret()(mockRequest, mockResponse, mockNext);
        expect(result).toBeTruthy();
        expect(mockResponse.status).not.toBeCalledWith(401);
    });

    it("Should let the request go to the next middleware if the path is /healthcheck", () => {
        httpConfig.authKey = "MyAuthKey";
        mockRequest.path = '/healthcheck';
        const result = authorizeSecret()(mockRequest, mockResponse, mockNext);
        expect(result).toBeTruthy();
        expect(mockResponse.status).not.toBeCalledWith(401);
        mockRequest.path = '/test';
    });

    it("Should let the request go to the next middleware if the path is /", () => {
        httpConfig.authKey = "MyAuthKey";
        mockRequest.path = '/';
        const result = authorizeSecret()(mockRequest, mockResponse, mockNext);
        expect(result).toBeTruthy();
        expect(mockResponse.status).not.toBeCalledWith(401);
        mockRequest.path = '/test';
    });

    it("Should return 401 if the header auth-key is not correct", () => {
        httpConfig.authKey = "WrongAuthKey";
        const result = authorizeSecret()(mockRequest, mockResponse, mockNext);
        expect(result).toBeFalsy();
        expect(mockResponse.status).toBeCalledWith(401);
    });
});

