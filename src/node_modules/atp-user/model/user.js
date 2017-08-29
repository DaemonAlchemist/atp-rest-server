/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity} from 'atp-active-record';

export default class User extends Entity
{
    constructor() {
        super('user', 'atpadmin_users');
    }

    getByUserName(userName, callback) {
        return this.where('username', userName).get(callback);
    }
}
