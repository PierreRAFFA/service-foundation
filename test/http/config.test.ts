import { httpConfig, setHttpConfig } from "../../src/modules/http/config";
import { IHttpConfig } from "../../src/interfaces";
import { defaultConfig } from "../../src/constants";

describe('httpConfig', () => {
    it('should set the config', () => {
        const config: IHttpConfig = {
            port: 1000,
        };
        setHttpConfig(config);
        expect(httpConfig).toBe(config);
    });

    it('should set the default config if no config sent', () => {
        setHttpConfig(undefined);
        expect(httpConfig).toBe(defaultConfig.http);
    });

    it('should set the default config if no config is < 0', () => {
        setHttpConfig({
            port: -1
        });
        expect(httpConfig).toEqual(defaultConfig.http);
    });

    it('should set the default config if no config is >= 65536', () => {
        setHttpConfig({
            port: 65536
        });
        expect(httpConfig).toEqual(defaultConfig.http);
    });
});
