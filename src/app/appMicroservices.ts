import { IMicroservice, IMicroservices } from "../interfaces";
import { Microservices } from "../constants";

const registeredMicroservices: IMicroservices = {};

export function registerMicroservice(service: IMicroservice): void {
    registeredMicroservices[service.name] = service;
}

export function getMicroservice(name: Microservices): IMicroservice {
    return registeredMicroservices[name] || {
        name: name,
        url: undefined,
        authKey: undefined,
    };
}

export { registeredMicroservices };
