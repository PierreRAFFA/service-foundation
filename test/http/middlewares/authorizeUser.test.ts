import authorizeUser from "../../../src/modules/http/middlewares/authorizeUser";

const mockResponse: any = {
    status: jest.fn(() => {
        return { send: jest.fn() };
    }),
};
const mockNext = jest.fn();

describe('userAuth', () => {
    it('should return request', () => {
        mockResponse.status.mockClear()
        const mockRequest: any = {
            headers: {
                'user': '{"id":4594,"roles":"1,2,4,9,11"}'
            },
        };

        const result = authorizeUser()(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).not.toBeCalledWith(401);

    });

    it('should throw error if no user is specified in the headers', () => {
        mockResponse.status.mockClear();
        const mockRequest: any = {
            headers: {
            },
        };

        const result = authorizeUser()(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toBeCalledWith(401);

    });

    it('should throw error if the specified user in the headers is not a valid json', () => {
        mockResponse.status.mockClear();
        const mockRequest: any = {
            headers: {
                'user': '{"invalid}'
            },
        };

        const result = authorizeUser()(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).toBeCalledWith(401);

    });

    it('should ignore user on /healthcheck', () => {
        mockResponse.status.mockClear();
        const mockRequest: any = {
            path: '/healthcheck',
            headers: {},
        };

        const result = authorizeUser()(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).not.toBeCalledWith(401);
    });


    it('should ignore user on /', () => {
        mockResponse.status.mockClear();
        const mockRequest: any = {
            path: '/',
            headers: {},
        };

        const result = authorizeUser()(mockRequest, mockResponse, mockNext);
        expect(mockResponse.status).not.toBeCalledWith(401);
    });
});
