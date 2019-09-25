import { reduce } from 'lodash';
import { appConfig } from "./appConfig";
import { IAppHealth, IMicroservice, IComponent } from "../interfaces";
import { registeredMicroservices } from "./appMicroservices";
import { HealthStatus, MicroserviceStatus } from "../constants";

interface IDetails {
    [name: string]: IComponentDetails;
}

interface IComponentDetails {
    status: HealthStatus;
    message: string;
}

/**
 * Specifies a list of services to be monitored via /healthcheck
 *
 * @type {any[]}
 * @private
 */
const _components: Array<IComponent> = [];

/**
 * Registers a component to be monitored via healthcheck
 *
 * @param {IComponent} service
 * @returns {number} the new length of the array
 */
export function healthcheckComponent(component: IComponent): number {
    return _components.push(component);
}

/**
 * Returns the app health
 *
 * @param {IComponent} service
 */
export function getHealth(): IAppHealth {
    const globalStatus: HealthStatus = reduce(_components, (result: HealthStatus, service: IComponent) => {

        switch (result) {
            case HealthStatus.Pass:
                return service.status;
            case HealthStatus.Warn:
                if (service.status === HealthStatus.Fail) {
                    return HealthStatus.Fail;
                } else {
                    return HealthStatus.Warn;
                }
            case HealthStatus.Fail:
                return HealthStatus.Fail;
        }
    }, HealthStatus.Pass);

    // get memory
    const memoryUsed: number = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);

    //list the components to health check
    const details: IDetails = reduce(_components, (result: IDetails, component: IComponent) => {
        return {...result, [component.name]: {
                status: component.status,
                message: component.errorMessage,
            }
        };
    }, {});

    //list the configured microservices
    const ms: any = reduce(registeredMicroservices, (result: any, ms: IMicroservice) => {
        return {...result, [ms.name]: getMicroserviceStatus(ms)};
    }, {});

    return {
        status: globalStatus,
        version: appConfig.version,
        memory: `${memoryUsed} MB`,
        details,
        microservices: ms,
    };
}

function getMicroserviceStatus(ms: IMicroservice): string {
    const isConfigured: boolean = !!ms.url && !!ms.authKey;
    if (isConfigured) {
        return MicroserviceStatus.Configured;
    }

    const isConfiguredWithoutAuthKey: boolean = !!ms.url && !ms.authKey;
    if (isConfiguredWithoutAuthKey) {
        return MicroserviceStatus.ConfiguredWithoutAuthKey;
    }

    return MicroserviceStatus.UrlMissing;
}


