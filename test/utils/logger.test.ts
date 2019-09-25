import { appConfig } from "../../src/app/appConfig";
import { configureBugsnag } from "../../src/components/bugsnag";
appConfig.bugsnagKey = 'key';
appConfig.version = '1.0.0';
configureBugsnag(appConfig.bugsnagKey, appConfig.version);

import { Loggly } from 'winston-loggly-bulk';
import { enableLoggly } from "../../src/utils/logger";

describe('Logger', () => {
    it("it should not register the transports for Loggly", () => {
        appConfig.logglyEnable = true;
        appConfig.logglyToken = 'token';
        appConfig.logglySubdomain = 'Subdomain';
        appConfig.logglyTags = ['tag1', 'tag2'];

        const loggerInstance = require('../../src/utils/logger').default;
        expect(loggerInstance.transports.length).toBe(2);
    });
});

describe('Logger', () => {
    it("it should NOT enable Loggly as appConfig is not set properly", () => {
        appConfig.logglyEnable = true;
        appConfig.logglyToken = undefined;
        appConfig.logglySubdomain = 'Subdomain';
        appConfig.logglyTags = ['tag1', 'tag2'];

        enableLoggly();
        const loggerInstance = require('../../src/utils/logger').default;
        expect(loggerInstance.transports.length).toBe(2);
    });
});

describe('Logger', () => {
    it("it should enable Loggly as logglyEnable is false", () => {
        appConfig.logglyEnable = false;
        appConfig.logglyToken = 'token';
        appConfig.logglySubdomain = 'Subdomain';
        appConfig.logglyTags = ['tag1', 'tag2'];

        enableLoggly();
        const loggerInstance = require('../../src/utils/logger').default;
        expect(loggerInstance.transports.length).toBe(2);
    });
});

describe('Logger', () => {
    it("it should enable Loggly", () => {
        appConfig.logglyEnable = true;
        appConfig.logglyToken = 'token';
        appConfig.logglySubdomain = 'Subdomain';
        appConfig.logglyTags = ['tag1', 'tag2'];

        enableLoggly();
        const loggerInstance = require('../../src/utils/logger').default;
        expect(loggerInstance.transports.length).toBe(3);
    });
});
