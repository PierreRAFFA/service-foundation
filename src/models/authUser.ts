import { IRequestUserData } from "../interfaces";
import { map } from 'lodash';

/**
 * It would be good to have the same structure as User here
 * as the roles is a list whereas in User.ts roles is an array of role
 */
export class AuthUser {

    readonly id: number;
    readonly roles: Array<number> = [];

    constructor(userData: IRequestUserData) {
        this.id = userData.id;
        if (userData.roles) {
            this.roles = map(
                userData.roles.split(','),
                (role: string) => Number(role)
            );
        }
    }
}
