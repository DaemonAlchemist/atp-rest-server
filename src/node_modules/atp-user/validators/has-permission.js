/**
 * Created by Andy on 8/29/2017.
 */

import {error, validate} from "atp-validator";

export default permissionList => validate(
    true, //TODO:  Implement
    "You do not have permission to access this",
    403
);
