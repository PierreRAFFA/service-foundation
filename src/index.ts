import logger, { enableLoggly, setLogLevel } from './utils/logger';
import { healthcheckComponent } from "./app/appHealth";
import { amqp, Amqp } from "./modules/amqp/amqp";
import { IAppConfig, IMicroservice, IComponent } from "./interfaces/index";
import { appConfig, setAppConfig } from "./app/appConfig";
import { Server } from "./modules/http/server";
import { configureBugsnag } from "./components/bugsnag";
import { registerMicroservice } from "./app/appMicroservices";

const chalk = require('chalk');

export class App {

    /**
     * AMQP Interface
     */
    readonly amqp: Amqp;

    /**
     * HTTP Interface
     */
    readonly http: Server;
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    constructor() {
        chalk.enabled = true;
        logger.info(chalk.bgGreen('NODE_ENV:', process.env.NODE_ENV));

        this.amqp = amqp;
        this.http = new Server();
    }

    /**
     * Sets the app config and configure the app according to it
     *
     * @param value
     */
    public config(value: IAppConfig): App {
        //store config or use a default one
        setAppConfig(value);
        logger.info(chalk.bgGreen('App version', appConfig.version));

        //configure bugsnag
        configureBugsnag(appConfig.bugsnagKey, appConfig.version);

        //configure Loggly
        enableLoggly();

        //set the loglevel as specified in the appConfig
        setLogLevel(appConfig.logLevel);

        return this;
    }

    /**
     * Registers a component to be monitored via healthcheck
     *
     * Each component to be monitored should implement IComponent or be castable to IComponent
     * @param {IComponent} service
     */
    public healthcheckComponent(component: IComponent): App {
        healthcheckComponent(component);
        return this;
    }

    /**
     * Registers a microservice to be displayed via healthcheck
     *
     * @param microservice
     */
    public registerMicroservice(microservice: IMicroservice): App {
        registerMicroservice(microservice);
        return this;
    }
}

////////////////////////////////////////////////////////////
/////////////////////////////////////////////////  RUN CORE AS STANDALONE (TO KEEP PLEASE)
// import { IAmqpConfig } from "./interfaces/index";
// import { Request, Response } from "express";
// import { Microservices } from "./constants";
// import * as dal from "./dal";
// import { request } from "./dal/httpClient";
// import { AxiosResponse } from "axios";
// import { backoff } from "./decorators/backoff";
// import { execAsBackoff } from "./utils/backoff";
//
//
// class Salesforce {
//     private _prop: string = 'ok';
//
//     @backoff()
//     public async doRequest(param: string, param2: string) {
//         const n = Math.random();
//         console.log('param', param);
//         console.log('param2', param2);
//         console.log('param', this._prop);
//         if (n > 0.8) {
//             return {param1: 'ok'};
//         } else {
//             throw new Error('oups Request Failed');
//         }
//     }
// }
//
// const app: App = new App();
//
// // register microservices
// app.registerMicroservice({
//     name: Microservices.UsersDb,
//     url: 'https://myms.com/',
//     authKey: 'auth_key',
// });
//
// // APP CONFIG
// app.config({
//     version: '1.0.0',
//     logLevel: 5,
//     // numBackoffs: 3,
//     // logglyEnable: false,
//     // logglySubdomain: 'domain',
//     // logglyToken:'token',
//     // logglyTags: ['generator', 'generator2'],
//     bugsnagKey: 'MyBugsnagKey',
// });
//
// //HTTP
// const server: Server = app.http;
// server.config({
//     port: 3101
// });
//
// server.router.get('/heyd', async (req: Request, res: Response) => {
//     // const user: any = await dal.getUser(1);
//     res.status(200).send('Server running successfully');
// });
// server.router.get('/test', (req: Request, res: Response) => {
//     logger.silly('test');
//
//     // const erere: any = undefined;
//     // erere.fnNotExist();
//     // console.log(logger.transports.length);
//     res.status(200).send('Server running test');
// });
//
// server.router.get('/getUser', async (req: Request, res: Response, next: Function) => {
//     logger.silly('test');
//
//     try {
//         const results: Array<any> = await dal.parallelFailFast(
//             // dal.getUser(244877),
//             // dal.getUser(244874)
//         );
//
//         res.status(200).send(results);
//     } catch (e) {
//         console.log(e);
//         next(e);
//     }
// });
//
// server.router.get('/getUser2', async (req: Request, res: Response, next: Function) => {
//     logger.silly('test');
//
//     const results: Array<any> = await dal.parallel(
//         // dal.getUser(244877),
//         // dal.getRelatedLpes(244874)
//     );
//     console.log('results[1] instanceof Error:', results[1] instanceof Error);
//     res.status(200).send(results);
//
// });
//
// server.router.get('/getUser3', async (req: Request, res: Response, next: Function) => {
//     logger.silly('test');
//
//     let results: AxiosResponse<any>;
//     try {
//         results = await request({
//             "baseURL": "https://myms.com/",
//             "headers": {"auth-key": "auth_key"},
//             "method": "get",
//             "url": "/users/244877d",
//             "params": {}
//         });
//         res.status(200).send(results.data.data);
//     } catch (e) {
//         next(e);
//     }
// });
//
// server.router.get('/getUser4', async (req: Request, res: Response, next: Function) => {
//     logger.silly('test');
//
//     let results: AxiosResponse<any>;
//     try {
//         results = await request({
//             "baseURL": "https://myms.com",
//             "headers": {"auth-key": "auth_key"},
//             "method": "get",
//             "url": "/wrong/244877",
//             "params": {}
//         });
//         res.status(200).send(results.data.data);
//     } catch (e) {
//         next(e);
//     }
// });
//
//
// server.router.get('/backoff', async (req: Request, res: Response, next: Function) => {
//     logger.silly('backoff');
//
//     try {
//         const s: Salesforce = new Salesforce();
//         const results: any = await s.doRequest('myParam', 'myParam2');
//         res.status(200).json(results);
//     } catch (e) {
//         console.log('error');
//         console.log(e);
//         next(e);
//     }
// });
//
// const test: string = 'testValue';
// server.router.get('/backoff2', async (req: Request, res: Response, next: Function) => {
//     logger.silly('backoff');
//
//     try {
//         const results: object = await execAsBackoff(doRequest, {numRetries: 2});
//         res.status(200).json(results);
//     } catch (e) {
//         console.log('error');
//         console.log(e);
//         next(e);
//     }
// });
//
// async function doRequest() {
//     console.log(test);
//     const n = Math.random();
//     if (n > 0.8) {
//         return {param1: 'ok'};
//     } else {
//         throw new Error('oups Request2 Failed');
//     }
// }
//
// app.http.start();
//
// // //AMQP
// // const amqpConfig: IAmqpConfig = {
// //     exchangeHost: 'amqp://guest:guest@0.0.0.0:5672',
// //     exchangeName: 'local',
// //     queueName: 'ms-service',
// //     deadLetterExchangeName: 'local-dlx',
// //     deadLetterQueueName: 'local-dlx-queue',
// // };
// //
// // app.amqp
// //     .config(amqpConfig)
// //     .registerRoutingKey('event.test1', (payload: any): any => {
// //
// //         // try {
// //         const u: any = undefined;
// //         u.error8();
// //         // }catch (e) {
// //         //     logger.error(e);
// //         // }
// //
// //     })
// //     .start();
