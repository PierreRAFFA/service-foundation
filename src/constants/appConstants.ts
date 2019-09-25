/**********************************************
 * App
 **********************************************/
export enum LogLevel {
    Level0_Error = 0,
    Level1_Warn = 1,
    Level2_Info = 2,
    Level3_Verbose = 3,
    Level4_Debug = 4,
    Level5_Silly = 5,
}

export const defaultConfig = {
    app: {
        version: 'No version specified in app.config',
        nodeEnv: 'development',
        numBackoffs: 10,
        logLevel: 5,
        logglyEnable: false,
    },
    http: {
        port: 3000,
    },
    amqp: {

    }
};

export enum Microservices {
    Undefined = 'undefined',
    UsersDb = 'ms-users-db',
    PropertiesDb = 'ms-properties-db',
    CheckoutsDb = 'ms-checkouts-db',
    LfsDb = 'ms-lfs-db',
    ValuationsDb = 'ms-valuations-db',
    AppointmentsDb = 'ms-appointments-db',
}

export enum HealthStatus {
    Initialisation = 'initialisation',
    Pass = 'pass',
    Warn = 'warn',
    Fail = 'fail',
}

export enum MicroserviceStatus {
    Configured = 'configured',
    ConfiguredWithoutAuthKey = 'configuredWithoutAuthKey',
    UrlMissing = 'urlMissing',
}
