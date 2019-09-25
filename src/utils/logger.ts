import * as winston from 'winston';
import { format } from "logform";
import combine = format.combine;
import timestamp = format.timestamp;
import splat = format.splat;
import printf = format.printf;

import { Loggly } from 'winston-loggly-bulk';
import { ConsoleTransportInstance } from "winston/lib/winston/transports";
import * as Transport from "winston-transport";
import { Logger } from "winston";
import { appConfig } from "../app/appConfig";
import { getBugsnagClient } from "../components/bugsnag";
import { Bugsnag } from "bugsnag";

const levels = [
    'error',
    'warn',
    'info',
    'verbose',
    'debug',
    'silly'
];

/**
 * Transport
 * @type {winston.ConsoleTransportInstance}
 */
const consoleTransport: ConsoleTransportInstance = new winston.transports.Console({
});

/**
 * Exception Transport
 * @type {winston.ConsoleTransportInstance}
 */
const exceptionTransport: ConsoleTransportInstance = new winston.transports.Console({
    handleExceptions: true,
    log: (info: any, next) => {
        const isLoggerError: boolean = info.level === 'error';
        if (isLoggerError || info.error) {
            const bugsnagClient: Bugsnag = getBugsnagClient();
            bugsnagClient && bugsnagClient.notify(info);
        }
        next();
    },
});

/**
 * Custom format
 * @type {Format}
 */
const customFormat = printf(info => {
    // on logger.error()
    if(info instanceof Error) {
        const bugsnagClient: Bugsnag = getBugsnagClient();
        bugsnagClient && bugsnagClient.notify(info, {payload: info.payload});
        return `[${new Date(info.timestamp).toISOString()}] ${info.level.toUpperCase()}: ${info.message}\n${info.stack}`;
    }
    return `[${new Date(info.timestamp).toISOString()}] ${info.level.toUpperCase()}: ${info.message}`;
});

const transports: Array<Transport> = [consoleTransport];
const exceptionHandlers: Array<Transport> = [exceptionTransport];


/**
 * Creates the logger using the transports and custom format
 * @type {winston.Logger}
 */
const logger: Logger = winston.createLogger({
    level: levels[Number(appConfig.logLevel)],
    silent: process.env.NODE_ENV === 'test',
    format: combine(
        splat(),
        timestamp(),
        customFormat
    ),
    //all logs
    transports,
    //uncaught errors
    exceptionHandlers,
    exitOnError: false,
});

export default logger;

/////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////// Logger Utils
/**
 * Create a dedicated transport for Loggly
 *
 * @returns {boolean}
 */
export function createLogglyTransport(): Transport | undefined {
    if (appConfig.logglyEnable && appConfig.logglyToken && appConfig.logglySubdomain && appConfig.logglyTags) {
        return new Loggly({
            token: appConfig.logglyToken,
            subdomain: appConfig.logglySubdomain,
            tags: appConfig.logglyTags,
            json: true,
        });
    }
    return undefined;
}

/**
 * Enables Loggly if the config is set
 */
export function enableLoggly(): void {
    const logglyTransport: Transport = createLogglyTransport();
    if (logglyTransport) {
        logger.add(logglyTransport);
    }
}

export function setLogLevel(level: number) {
    logger.level = levels[level];
}
