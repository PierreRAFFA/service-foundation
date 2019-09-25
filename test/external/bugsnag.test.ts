import { configureBugsnag, getBugsnagClient } from "../../src/components/bugsnag";
import { appConfig } from "../../src/app/appConfig";
import * as bugsnag from "bugsnag";


// Mock Bugsnag
appConfig.bugsnagKey = 'key';
appConfig.version = '1.0.0';

const mockClient = {
    configure: jest.fn().mockImplementation(function () {
        return null;
    }),
};

const spy = jest.spyOn(bugsnag, 'register').mockImplementation((): any => {
    return mockClient;
});

describe('bugsnag', () => {
    it('should configure bugsnag', () => {
        configureBugsnag('key1', '1.0.0');
        expect(spy).toHaveBeenCalled();

    });
    it('should return bugsnag client', () => {
        configureBugsnag('key1', '1.0.0');

        expect(getBugsnagClient()).toBeDefined();

    });
});
