/**
 * Created by Andy on 9/5/2017.
 */

const fs = require('fs');
const {exec} = require('child_process');
const spawn = require('cross-spawn');
const process = require('process');
const Promise = require('promise');

//Set delay for starting the recompile (PHPStorm tends to fire multiple file changes events in quick bursts)
const delay = 500;

//Event for triggering the recompile
let moduleCompileEvent = null;
let appCompileEvent = null;

//Only restart on sub-module changes in /node_modules/<MODULE>/src/<FILE_PATH>.js files
const filePattern = /^node_modules[\/\\]([a-z\-_0-9]+)[\/\\]src[\/\\](.*\.js)$/;

//Allow the server process to be killed and restarted
let serverProcess = null;
const restart = () => {
    //Kill the server if one already exists
    if(serverProcess) {
        console.log("Terminating REST server");
        serverProcess.kill();
    }

    //Restart the server
    console.log("Starting REST server");
    serverProcess = spawn("node", ["lib/index.js"]);

    //Show all output
    serverProcess.stdout.on('data', chunk => {console.log(chunk.toString());});
    serverProcess.stderr.on('data', chunk => {console.log(chunk.toString());});
    serverProcess.on('error', err => {
        console.log(err);
    });
    serverProcess.on('close', code => {
        console.log(`REST server exited with code ${code}`);
    });
};

//Keep track of all startup tasks
let promises = [];

//Make sure all of the modules are compiled
console.log("Compiling main app...");
promises.push(new Promise((resolve, reject) => {
    exec("npm run compile", (err, stdout, stderr) => {
        if(stderr.length > 0) {
            console.log("Main app FAILED to recompile:");
            console.log(stderr);
            reject();
        } else {
            console.log("Main app recompiled");
            resolve()
        }
    });
}));


fs.readdir("lib/node_modules", (err, files) => {
    files.forEach(module => {
        console.log("Compiling module: " + module + "...");
        promises.push(new Promise((resolve, reject) => {
            exec("cd lib/node_modules/" + module + " && npm run compile", (err, stdout, stderr) => {
                if(stderr.length > 0) {
                    console.log("Module " + module + " FAILED to recompile:");
                    console.log(stderr);
                    reject();
                } else {
                    console.log("Module " + module + " recompiled");
                    resolve();
                }
            });
        }));
    });

    Promise.all(promises).then(() => {
        restart();

        console.log("Watching for file changes in main app...");
        fs.watch('src', (eventType, fileName) => {
            clearTimeout(appCompileEvent);
            appCompileEvent = setTimeout(() => {
                console.log("Recompiling main app");
                exec("npm run compile", (err, stdout, stderr) => {
                    if(stderr.length > 0) {
                        console.log("Main app FAILED to recompile:");
                        console.log(stderr);
                    } else {
                        console.log("Main app recompiled");
                        restart();
                    }
                });
            }, delay);
        });

        console.log("Watching for file changes in modules...");
        fs.watch('lib', {recursive: true}, (eventType, fileName) => {
            //Only recompile for matching files
            if(filePattern.test(fileName)) {
                //Stop the recompile event if another recent file change triggered it
                clearTimeout(moduleCompileEvent);

                //Queue the recompile event
                moduleCompileEvent = setTimeout(() => {
                    const match = filePattern.exec(fileName);
                    const module = match[1];
                    console.log("Recompiling module: " + module + "...");
                    exec("cd lib/node_modules/" + module + " && npm run compile", (err, stdout, stderr) => {
                        if(stderr.length > 0) {
                            console.log("Module " + module + " FAILED to recompile:");
                            console.log(stderr);
                        } else {
                            console.log("Module " + module + " recompiled");
                            restart();
                        }
                    });
                }, delay);
            }
        });
    });
});
