import logger from "../../../utils/logger";
import { Response, NextFunction } from "express";
import { IExtendedRequest, IRequestUserData } from "../../../interfaces";
import { AuthUser } from "../../../models/authUser";


/**
 * Gets the user information or rejects the call
 */
export default function authorizeUser() {
    return function (req: IExtendedRequest, res: Response, next: NextFunction) {
        const allowedRoutes = [
            '/',
            '/healthcheck'
        ];

        if (allowedRoutes.indexOf(req.path) === -1) {
            // Get user info from JWT
            // At the moment, this is not encrypted
            const userDataString: any = req.headers['user'];

            if (userDataString) {
                try {
                    const userData: IRequestUserData = JSON.parse(userDataString);
                    const user: AuthUser = new AuthUser(userData);

                    //store the user information to Request
                    req.user = user;

                    return next();
                } catch (e) {
                    logger.error(e);
                }
            }

            res.status(401).send({ error: 'Invalid user provided' });
            return false;
        }

        next();
        return true;
    };
}
