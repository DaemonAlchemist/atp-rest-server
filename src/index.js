/**
 * Created by Andy on 8/25/2017.
 */

import dotenv from 'dotenv';
import express from 'express';
import cluster from 'cluster';
import os from 'os';
import cors from 'cors';
import url from 'url';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import {o, repeat} from 'atp-sugar';
import config from 'atp-config';
import appConfig from './app.config';
import {createRoutes} from 'atp-rest';

dotenv.config();

if(cluster.isMaster && process.env.ENV_TYPE === 'local') {
    repeat(os.cpus().length, () => {cluster.fork();});
    cluster.on('exit', worker => {cluster.fork();});
} else {
    //Merge module components
    const modulesMerged = appConfig.modules.reduce((combined, module) => combined.merge(module), o({})).raw;

    //Set default and app config values
    config.setDefaults(modulesMerged.config);
    config.setValues(appConfig.config);


    //Create the app and use the JSON body parser and cookie parser for all requests
    //Add all module routes
    const app = createRoutes(
        express()
            .use(cors({exposedHeaders: "Login-Token"}))
            .use(bodyParser.json({limit: '50mb'}))
            .use(cookieParser()),
        modulesMerged.routes
    )
    //Allow cross-origin requests

    //Handle 404s by showing the user what they sent
        .use((request, res, next) => {
            res.status(404).send({
                messages: [{type: 'error', text: request.url + ' not found'}],
                debug: {
                    request: {
                        headers: request.headers,
                        method: request.method,
                        url: request.url,
                        query: url.parse(request.url, true).query,
                        body: request.body
                    }
                }
            });
        });

    switch(process.env.ENV_TYPE) {
        case 'local':
            //Start the server
            app.listen(process.env.PORT, () => {
                console.log(`REST server listening on port ${process.env.PORT}!`);
            });
            break;
        case 'awsLambda':

            break;
    }
}
