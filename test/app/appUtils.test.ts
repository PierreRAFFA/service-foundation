import { createBackOff, isLogglyEnable } from "../../src/app/appUtils";
import {Backoff} from "backoff";
import { appConfig } from "../../src/app/appConfig";

describe('AppUtils', () => {
    it('Should be defined and return a backoff instance', () => {
        const backoff = createBackOff();
        expect(backoff).toBeDefined();
        expect(backoff).toBeInstanceOf(Backoff);
    });

    describe('When logglys is not configured', () => {
        it('should return false', () => {
            appConfig.logglyEnable = true;
            appConfig.logglySubdomain = undefined;
            appConfig.logglyTags = undefined;
            appConfig.logglyToken = undefined;
            expect(isLogglyEnable()).toBe(false);
        });
    });

    describe('When logglys is not configured', () => {
        it('should return false', () => {
            appConfig.logglyEnable = true;
            appConfig.logglySubdomain = 'ok';
            appConfig.logglyTags = undefined;
            appConfig.logglyToken = undefined;
            expect(isLogglyEnable()).toBe(false);
        });
    });

    describe('When logglys is not configured', () => {
        it('should return false', () => {
            appConfig.logglyEnable = true;
            appConfig.logglySubdomain = undefined;
            appConfig.logglyTags = [];
            appConfig.logglyToken = undefined;
            expect(isLogglyEnable()).toBe(false);
        });
    });

    describe('When logglys is not configured', () => {
        it('should return false', () => {
            appConfig.logglyEnable = true;
            appConfig.logglySubdomain = undefined;
            appConfig.logglyTags = undefined;
            appConfig.logglyToken = 'ok';
            expect(isLogglyEnable()).toBe(false);
        });
    });

    describe('When logglys is not configured', () => {
        it('should return false', () => {
            appConfig.logglyEnable = false;
            appConfig.logglySubdomain = 'ok';
            appConfig.logglyTags = [];
            appConfig.logglyToken = 'ok';
            expect(isLogglyEnable()).toBe(false);
        });
    });

    describe('When logglys is not configured', () => {
        it('should return false', () => {
            appConfig.logglyEnable = true;
            appConfig.logglySubdomain = 'ok';
            appConfig.logglyTags = [];
            appConfig.logglyToken = 'ok';
            expect(isLogglyEnable()).toBe(true);
        });
    });
});
