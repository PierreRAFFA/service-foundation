/**********************************************
 *
 *
 *
 *
 * These interfaces should be related to the app
 *
 *
 *
 *
 **********************************************/
import { IncomingHttpHeaders } from "http";
import { Request } from "express";
import { AuthUser } from "../models/authUser";
import { HealthStatus, Microservices } from "../constants";

/**********************************************
 * App
 **********************************************/
export interface IAppConfig {
    version: string;
    numBackoffs?: number;
    logLevel?: number;
    logglyEnable?: boolean;
    logglyToken?: string;
    logglySubdomain?: string;
    logglyTags?: Array<string>;
    bugsnagKey?: string;
}

export interface IAppHealth {
    status: HealthStatus;
    version: string;
    memory: string;
    details?: any;
    microservices?: any;
}

export interface IMicroservices {
    [name: string]: IMicroservice;
}

export interface IComponent {
    name: string;
    status: HealthStatus;
    errorMessage: string;
}

export interface IMicroservice {
    name: Microservices;
    url: string;
    authKey?: string;
}

/**********************************************
 * Http
 **********************************************/
export interface IHttpConfig {
    port: number;
    authKey?: string;
}

export interface IHeader extends IncomingHttpHeaders {
    'auth-key': string;
    'client-ip': string;
    'client-route': string;
    user?: string;
}

export interface IExtendedRequest extends Request {
    user?: AuthUser;
    headers: IHeader;
}

export interface IRequestUserData {
    id: number;
    roles: string;
}

/**********************************************
 * AMQP
 **********************************************/
export interface IAmqpConfig {
    exchangeHost: string;
    exchangeName: string;
    queueName: string;
    deadLetterExchangeName: string;
    deadLetterQueueName: string;
}

export interface IRoutingKeys {
    [event: string]: IMessageConsumer;
}

export interface IMessageConsumer {
    (payload: any): any;
}
