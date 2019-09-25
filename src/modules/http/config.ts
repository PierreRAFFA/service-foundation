import { IHttpConfig } from "../../interfaces";
import { defaultConfig } from "../../constants";

let httpConfig: IHttpConfig = defaultConfig.http;

export function setHttpConfig(value: IHttpConfig): void {
    httpConfig = value || defaultConfig.http;

    // Check port validity, set default if need be
    if (!httpConfig.port || httpConfig.port < 0 || httpConfig.port >= 65536) {
        httpConfig.port = defaultConfig.http.port;
    }
}

export { httpConfig };
