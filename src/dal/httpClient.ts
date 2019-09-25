import { get, set } from 'lodash';
import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import logger from "../utils/logger";
import { IDalErrorResponse } from "../interfaces";


/**
 * Requests to the ms
 * Catches any errors here
 * May return undefined in case of error
 *
 * @param config
 */
export function request<T = any>(config: AxiosRequestConfig): AxiosPromise<T> {
    if (config.baseURL) {
        logger.silly(JSON.stringify(config, undefined, 2));
        return axios(config).catch((reason: IDalErrorResponse) => {
            //log into Bugsnag
            logger.error(reason);
            logger.warn(JSON.stringify(hideSecret(config)));
            throw formatError(reason);
        });
    } else {
        logger.error(new Error(`Could not make the http request. Please configure this microservice with app.registerMicroservice() - ${JSON.stringify(hideSecret(config))}`));
    }
}

/**
 * Formats the error and passes the correct statusCode to avoid to get 500 all the time
 *
 * @param dalErrorResponse
 */
export function formatError(dalErrorResponse: IDalErrorResponse): Error {
    const message: string = get(dalErrorResponse, 'response.statusText');
    const statusCode: string = get(dalErrorResponse, 'response.status') || 500;
    const error: Error = new Error();
    error.message = message;
    set(error, 'statusCode', statusCode); // to avoid transpile error
    return error;
}

/**
 * Returns the config without the authKey
 *
 * @param config
 */
function hideSecret(config: AxiosRequestConfig): AxiosRequestConfig {
    let authKey: string = get(config, 'headers[\'auth-key\']');
    if (authKey) {
        authKey = '**********';
    }
    return {...config, headers: {
        ...config.headers, 'auth-key': authKey
    }};
}
