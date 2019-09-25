import { appConfig, setAppConfig } from "../../src/app/appConfig";
import { IAppConfig } from "../../src/interfaces";
import { defaultConfig } from "../../src/constants";

describe('httpConfig', () => {
    it('should set the config', () => {
        const config: IAppConfig = {
            version: '1.0.0',
            numBackoffs: 1,
            logLevel: 1,
            logglyEnable: false,
        };

        setAppConfig(config);
        expect(appConfig).toBe(config);
    });

    it('should set the default config if no config sent', () => {
        setAppConfig(undefined);
        expect(appConfig).toBe(defaultConfig.app);
    });
});
