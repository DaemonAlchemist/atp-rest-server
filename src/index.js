/**
 * Created by Andy on 8/25/2017.
 */

import express from 'express';
import {o} from 'atp-sugar';
import config from 'atp-config';
import appConfig from '../config/app';

//Import all modules
import userModule from 'atp-user';

const modules = [userModule];

//Merge module components
//  routes are module-dependent and do not need to be in the merged object
const modulesMerged = o(modules).reduce(
    (combined, module) => combined.merge(module),
    o({})
).raw;

//Join default module config
config.setDefaults(modulesMerged.config);
console.log("Module config loaded");

//Set app config
config.setValues(appConfig);
console.log("App config loaded");

//Add all routes and start the server
o(modulesMerged.routes)
    .reduce((server, routes, basePath) => server.use("/" + basePath, routes), express())
    .use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send(JSON.stringify(err));
    })
    .listen(3000,  () => {
        console.log('REST server listening on port 3000!');
    });
