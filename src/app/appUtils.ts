/**
 * This file contains some useful methods which can be used for the ms development
 *
 *
 *
 */
import { Backoff, fibonacci } from 'backoff';
import { getHealth } from "./appHealth";
import { Loggly } from 'winston-loggly-bulk';
import { appConfig } from "./appConfig";
import { getBugsnagClient } from "../components/bugsnag";
import { Bugsnag } from "bugsnag";

/**
 * Returns a backoff object already configured
 *
 * @returns {Backoff}
 */
export function createBackOff(): Backoff {
    const backoff: Backoff = fibonacci({
        randomisationFactor: 0,
        initialDelay: 1000,
        maxDelay: 60000
    });
    backoff.failAfter(appConfig.numBackoffs || 10);

    backoff.on('fail', () => {
        const bugsnag: Bugsnag = getBugsnagClient();
        bugsnag && bugsnag.notify('One ore more services have failed', {health: getHealth()});
    });

    return backoff;
}

/**
 * Specifies whether the app has to use Loggly
 *
 * @returns {boolean}
 */
export function isLogglyEnable(): boolean {
    return appConfig.logglyEnable === true && !!appConfig.logglyToken && !!appConfig.logglySubdomain && !!appConfig.logglyTags;
}
