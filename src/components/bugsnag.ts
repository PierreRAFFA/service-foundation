import * as bugsnag from 'bugsnag';
import { Bugsnag } from "bugsnag";

let bugsnagClient: Bugsnag = undefined;

/**
 * Configures Bugsnag
 *
 * @param bugsnagKey
 * @param appVersion
 */
export function configureBugsnag(bugsnagKey: string, appVersion: string) {
    if (bugsnagKey) {
        bugsnagClient = bugsnag.register(bugsnagKey);
        bugsnagClient.configure({
            appVersion: appVersion
        });
    }
}

/**
 * Gets the client
 */
export function getBugsnagClient(): Bugsnag {
    return bugsnagClient;
}
