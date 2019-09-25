import { IAppConfig } from "../interfaces/index";
import { defaultConfig } from "../constants";

let appConfig: IAppConfig = defaultConfig.app;

export function setAppConfig(value: IAppConfig): void {
    appConfig = value || defaultConfig.app;
}

export { appConfig };
