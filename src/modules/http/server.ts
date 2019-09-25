import { Express, Request, Response, Router } from "express";
import logger, { createLogglyTransport } from "../../utils/logger";
import { IHttpConfig } from "../../interfaces";
import * as express from "express";
import * as qs from "qs";
import { isLogglyEnable } from "../../app/appUtils";
import * as expressWinston from "express-winston";
import { appConfig } from "../../app/appConfig";
import { getBugsnagClient } from "../../components/bugsnag";
import * as compression from "compression";
import * as morgan from "morgan";
import * as bodyParser from "body-parser";
import * as expressValidator from "express-validator";
import * as path from "path";
import * as healthcheckController from "./controllers/healthcheckController";
import * as errorHandler from "errorhandler";
import { httpConfig, setHttpConfig } from "./config";
import authorizeSecret from "./middlewares/authorizeSecret";

const chalk = require('chalk');

export class Server {

    /**
     * Router to manage all Express routes
     */
    readonly express: Express;

    /**
     * Router to manage all Express routes
     * Exposed for additional routes
     */
    readonly router: Router;
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    constructor() {
        this.express = express();
        this.router = Router();
    }

    public config(config: IHttpConfig): Server {
        setHttpConfig(config);
        return this;
    }

    /**
     * @Todo register middlewares to maintain a specific order
     */
    public registerApplicationLevelMiddleware(): Server {
        return this;
    }

    ////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////  START
    public async start(): Promise<Server> {
        chalk.enabled = true;

        // log config
        if (httpConfig) {
            logger.info(chalk.green('========================================================='));
            logger.info(chalk.green('HTTP_PORT (default 3000): ', httpConfig.port));
            logger.info(chalk.green('========================================================='));
        }

        // PLEASE READ THIS. This has to be set before anything else !
        this._setQueryParser();

        this._useApplicationLevelMiddlewares();

        this._configureRouter();

        this._useErrorHandlingMiddlewares();

        return new Promise<Server>((resolve: Function, reject: Function) => {
            this.express.listen(httpConfig.port, () => {
                logger.info(chalk.bgGreen('HTTP: Running at port %d'), httpConfig.port || 3000);
                resolve(this);
            });
        });
    }

    /**
     * Set a custom query parser
     * `arrayLimit` allows to extend the number of elements in an array specified in a GET parameter.
     * (Limited to 20 in the default Express parser)
     *
     * @private
     */
    private _setQueryParser() {
        this.express.set('query parser', function (str: string) {
            return qs.parse(str, {
                arrayLimit: 1000,
                // decoder: boolDecoder
            });
        });
    }

    /**
     * Configures Express Application-level middlewares
     *
     * @private
     */
    private _useApplicationLevelMiddlewares() {

        // Middleware to authorize via secret key
        if (httpConfig.authKey) {
            this.express.use(authorizeSecret());
        }

        // Winston/Loggly Transport
        if (isLogglyEnable()) {
            this.express.use(expressWinston.logger({
                transports: [
                    createLogglyTransport()
                ]
            }));
        }

        // To ensure that asynchronous errors are routed to the error handler, add the requestHandler middleware to your app as the first middleware
        if (appConfig.bugsnagKey) {
            this.express.use(getBugsnagClient().requestHandler);
        }

        // Middleware to compress the responses
        this.express.use(compression());

        // Middleware for the logs (Standard Apache combined log output)
        const logFormat: string = ':method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

        if (Number(appConfig.logLevel) <= 2) {
            this.express.use(morgan(logFormat, {
                skip: (req: Request, res: Response) => res.statusCode < 400,
                stream: {
                    write: logger.info
                }
            }));
        } else {
            this.express.use(morgan(logFormat, {
                stream: {
                    write: logger.info,
                }
            }));
        }

        // Middleware to parse the incoming request before the handlers
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: true}));

        // Middleware to check the inputs
        this.express.use(expressValidator());

        // Helmet.js helps secure Express servers through setting HTTP headers.
        // It adds HSTS, removes the X-Powered-By header and sets the X-Frame-Options header
        // to prevent click jacking, among other things. Setting it up is simple.
        this.express.use(require('helmet')());

        this.express.use(express.static(path.join(__dirname, 'public'), {maxAge: 31557600000}));
    }

    /**
     * Configures Express Router with generic routes
     *
     * @private
     */
    private _configureRouter() {
        this.router.get('/', (req: Request, res: Response) => {
            res.status(200).send('Server running successfully');
        });
        this.router.get('/healthcheck', healthcheckController.read);

        this.express.use('/', this.router);
    }

    /**
     * Configures Express Error Handling middlewares
     *
     * @private
     */
    private _useErrorHandlingMiddlewares() {
        // To ensure that synchronous errors are sent to Bugsnag, add the errorHandler middleware to your app as the first error middleware
        if (appConfig.bugsnagKey) {
            this.express.use(getBugsnagClient().errorHandler);
        }

        if (isLogglyEnable()) {
            this.express.use(expressWinston.errorLogger({
                transports: [
                    createLogglyTransport()
                ]
            }));
        }

        this.express.use(errorHandler());
    }
}
