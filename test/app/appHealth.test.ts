import { registerMicroservice } from "../../src/app/appMicroservices";
import { appConfig } from "../../src/app/appConfig";
import { getHealth, healthcheckComponent } from "../../src/app/appHealth";
import { HealthStatus, Microservices } from "../../src/constants";
import { IComponent, IMicroservice } from "../../src/interfaces";

process.memoryUsage = jest.fn().mockReturnValue({heapUsed: 44500000});

describe('AppHealth', () => {

    it("it should be able to register a service", () => {
        const length: number = healthcheckComponent({
            name: 'service1',
            status: HealthStatus.Pass,
            errorMessage: undefined,
        });
        return expect(length).toBe(1);
    });

    describe('When it returns the health', () => {
        it("it should return the current app version", async () => {
            appConfig.version = '2.0.0';
            expect(getHealth().version).toBe('2.0.0');
        });
    });

    describe('When it returns the health', () => {
        it("it should return the current memory used", async () => {
            expect(getHealth().memory).toBe('42 MB');
        });
    });

    describe('When it returns the health and the app has registered few services', () => {

        const service1: IComponent = {
            name: 'service1',
            status: HealthStatus.Pass,
            errorMessage: undefined,
        };
        const service2: IComponent = {
            name: 'service2',
            status: HealthStatus.Pass,
            errorMessage: undefined,
        };
        const service3: IComponent = {
            name: 'service3',
            status: HealthStatus.Pass,
            errorMessage: undefined,
        };

        beforeEach(() => {

            healthcheckComponent(service1);
            healthcheckComponent(service2);
            healthcheckComponent(service3);
        });

        it("it should return all services", async () => {
            expect(getHealth().details).toEqual({
                service1: {
                    status: service1.status,
                    message: service1.errorMessage,
                },
                service2: {
                    status: service2.status,
                    message: service2.errorMessage,
                },
                service3: {
                    status: service3.status,
                    message: service3.errorMessage,
                },
            });
        });
    });

    describe('When the app contains all services with status Pass', () => {
        beforeEach(() => {
            healthcheckComponent({
                name: 'service1',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });

            healthcheckComponent({
                name: 'service2',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });

            healthcheckComponent({
                name: 'service3',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });
        });

        it("it should return a global status to Pass", async () => {
            expect(getHealth().status).toBe(HealthStatus.Pass);
        });
    });


    describe('When the app contains 1 service with status Warn', () => {
        beforeEach(() => {
            healthcheckComponent({
                name: 'service1',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });

            healthcheckComponent({
                name: 'service2',
                status: HealthStatus.Warn,
                errorMessage: "warning message",
            });

            healthcheckComponent({
                name: 'service3',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });
        });

        it("it should return a global status to Warn", async () => {
            expect(getHealth().status).toBe(HealthStatus.Warn);
        });

        it("it should return the message to the details", async () => {
            expect(getHealth().details.service2.message).toBe("warning message");
        });
    });

    describe('When the app contains 1 service with status Fail', () => {
        beforeEach(() => {
            healthcheckComponent({
                name: 'service1',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });

            healthcheckComponent({
                name: 'service2',
                status: HealthStatus.Fail,
                errorMessage: "failing message",
            });

            healthcheckComponent({
                name: 'service3',
                status: HealthStatus.Pass,
                errorMessage: undefined,
            });
        });

        it("it should return a global status to Warn", async () => {
            expect(getHealth().status).toBe(HealthStatus.Fail);
        });

        it("it should return the message to the details", async () => {
            expect(getHealth().details.service2.message).toBe("failing message");
        });
    });

    describe('When configuring microservices without any key', () => {

        it("it should return the microservice as configuredWithoutAuthKey", async () => {
            const ms: IMicroservice = {
                name: Microservices.UsersDb,
                url: 'url',
                authKey: undefined,
            };
            registerMicroservice(ms);
            expect(getHealth().microservices).toEqual({
                "ms-users-db": "configuredWithoutAuthKey"
            });
        });
    });

    describe('When configuring microservices with a key', () => {

        it("it should return the microservice as configured", async () => {
            const ms: IMicroservice = {
                name: Microservices.UsersDb,
                url: 'url',
                authKey: 'key',
            };
            registerMicroservice(ms);
            expect(getHealth().microservices).toEqual({
                "ms-users-db": "configured"
            });
        });
    });

    describe('When configuring microservices without any url', () => {

        it("it should return the microservice as UrlMissing", async () => {
            const ms: IMicroservice = {
                name: Microservices.UsersDb,
                url: undefined,
                authKey: 'key',
            };
            registerMicroservice(ms);
            expect(getHealth().microservices).toEqual({
                "ms-users-db": "urlMissing"
            });
        });
    });

});

