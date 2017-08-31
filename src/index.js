/**
 * Created by Andy on 8/25/2017.
 */

import express from 'express';
import url from 'url';
import bodyParser from 'body-parser';

import {o} from 'atp-sugar';
import config from 'atp-config';
import appConfig from '../config/app';

//Import all modules
import userModule from 'atp-rest-uac';

//Create the list of REST modules
const modules = [userModule];

//Merge module components
const modulesMerged = modules.reduce((combined, module) => combined.merge(module), o({})).raw;

//Join default module config
config.setDefaults(modulesMerged.config);
console.log("Module config loaded");

//Set app config
config.setValues(appConfig);
console.log("App config loaded");

//Create the app and use the JSON body parser for all requests
const app = express().use(bodyParser.json());

//Add all module routes
o(modulesMerged.routes)
    .reduce((server, routes, basePath) => server.use("/" + basePath, routes), app)

    //Handle 404s by showing the user what they sent
    .use((request, res, next) => {
        res.status(404).send({
            messages: [{type: 'error', msg: 'Route not found'}],
            debug: {request: {
                headers: request.headers,
                method: request.method,
                url: request.url,
                query: url.parse(request.url, true).query,
                body: request.body
            }}});
    })

    //Start the server
    .listen(3000,  () => {
        console.log('REST server listening on port 3000!');
    });
