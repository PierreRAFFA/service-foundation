/*******************************************
 * To be applied to functions out of a class
 * This is used by the backoff decorator
 *
 *******************************************/
import { take } from 'lodash';
import logger from "./logger";

/**
 * Default timeouts in ms based on fibo with a max to 30000
 */
const DEFAULT_TIMEOUTS: Array<number> = [1000, 1000, 2000, 3000, 5000, 8000, 13000, 21000, 30000, 30000, 30000, 30000];

/**
 * Default Backoff Config
 */
const DEFAULT_CONFIG: IBackoffOptions = {
    numRetries: 10,
    onAllAttemptsReached: undefined,
};

export interface IOnAllAttemptsReached {
    (e: Error, args: Array<any>): any;
}

export interface IBackoffOptions {
    numRetries: number;
    onAllAttemptsReached?: IOnAllAttemptsReached;
}

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////  BACKOFF FOR DECORATOR
/**
 * Executes a function in a backoff (for a decorator)
 *
 * @param originalFunction
 * @param options
 * @param context
 * @param args
 */
export async function backoff<T = any>(originalFunction: Function, options: IBackoffOptions = undefined, context: any, ...args: Array<any>): Promise<T> {
    const fullOptions: IBackoffOptions = {...DEFAULT_CONFIG, ...options};
    return await retry<T>(originalFunction, context, args, fullOptions, take(DEFAULT_TIMEOUTS, fullOptions.numRetries));
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////  BACKOFF FOR FUNCTIONS
/**
 * Wrapped a function into a backoff and returns the composition
 *
 * @param originalFunction
 * @param options
 */
export function execAsBackoff<T = any>(originalFunction: Function, options: IBackoffOptions = undefined): any {
    return async (...args: Array<any>) => {
        const fullOptions: IBackoffOptions = {...DEFAULT_CONFIG, ...options};
        return await retry<T>(originalFunction, this, args, fullOptions, take(DEFAULT_TIMEOUTS, fullOptions.numRetries));
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////  RETRY MECHANISM
/**
 * Retries the function execution until:
 *   - the method is executed successfully
 *   - or, the max number of attempts have been reached
 *
 * @param originalFunction
 * @param context
 * @param args
 */
async function retry<T>(originalFunction: any, context: any = undefined, args: any[], options: IBackoffOptions, timeoutsLeft: Array<number>): Promise<T> {
    try {
        return await originalFunction.apply(context, args);
    } catch (e) {

        //error => retrying until the max number of attempts
        if (timeoutsLeft.length) {
            await sleep(timeoutsLeft.shift());
            return await retry<T>(originalFunction, context, args, options, timeoutsLeft);
        } else {
            //triggers onAllAttemptsReached callback
            options.onAllAttemptsReached && options.onAllAttemptsReached(e, args);
            throw e;
        }
    }
}

/**
 * Sleeps after a fail for a certain amount of time
 *
 * @param duration in ms
 */
async function sleep(duration: number) {
    logger.warn(`Retrying to consume the message in ${duration}ms`);
    return new Promise(resolve => setTimeout(resolve, duration));
}
