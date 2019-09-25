import logger from "../../../utils/logger";
import { Request, Response, NextFunction } from "express";
import { httpConfig } from "../config";


/**
 * Performs simple validation based on secret key
 *
 * @returns {(req: Request, res: Response, next: any) => boolean}
 */
export default function authorizeSecret() {
    return function (req: Request, res: Response, next: NextFunction) {
        const allowedRoutes = [
            '/',
            '/healthcheck'
        ];

        if (allowedRoutes.indexOf(req.path) === -1 && req.headers['auth-key'] !== httpConfig.authKey) {
            logger.error('The token provided is invalid');
            res.status(401).send({ error: 'Unauthorized' });
            return false;
        }

        next();
        return true;
    };
}
