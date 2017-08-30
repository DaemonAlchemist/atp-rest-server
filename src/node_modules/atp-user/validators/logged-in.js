/**
 * Created by Andy on 8/29/2017.
 */

import {error, validate} from "atp-validator";

export default request => validate(
    true,  //TODO:  Implement
    "You must be logged in to access this",
    401
);
