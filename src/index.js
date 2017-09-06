/**
 * Created by Andy on 8/25/2017.
 */

import express from 'express';
import url from 'url';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import {o} from 'atp-sugar';
import config from 'atp-config';
import appConfig from './app.config';

//Merge module components
const modulesMerged = appConfig.modules.reduce((combined, module) => combined.merge(module), o({})).raw;

//Set default and app config values
config.setDefaults(modulesMerged.config);
config.setValues(appConfig.config);

//Create the app and use the JSON body parser and cookie parser for all requests
const app = express()
    .use(bodyParser.json())
    .use(cookieParser());

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
