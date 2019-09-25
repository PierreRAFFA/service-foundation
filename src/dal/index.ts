import axios from 'axios';
import { formatError } from "./httpClient";

/**
 * Allows to request in parallel for the sake of performance and will wait for all requests response before throwing any error
 *
 * @param promises
 */
export async function parallel(...promises: Array<any>): Promise<any[]> {

    //catch the errors to avoid to be caught by axios
    const caughtPromises = promises.map((promise: Promise<any>) => promise.catch(error => error));

    return axios.all(caughtPromises)
        .then(axios.spread(function (...results: any[]) {
            return results;
        }))
        .catch(reason => {
            throw formatError(reason);
        });
}

/**
 * Allows to request in parallel for the sake of performance and will fail as soon as one of the calls fails
 * @Todo to be finished
 *
 * @param promises
 */
export async function parallelFailFast(...promises: Array<any>): Promise<any[]> {
    return axios.all(promises)
        .then(axios.spread(function (...results: any[]) {
            return results;
        }));
}
