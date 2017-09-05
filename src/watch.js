/**
 * Created by Andy on 9/5/2017.
 */

const fs = require('fs');
const {exec} = require('child_process');
const spawn = require('cross-spawn');
const process = require('process');

//Set delay for starting the recompile (PHPStorm tends to fire multiple file changes events in quick bursts)
const delay = 500;

//Event for triggering the recompile
let triggerEvent = null;

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
    serverProcess = spawn("node", ["src/app.js"]);

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
restart();

console.log("Watching for file changes...");
fs.watch('src', {recursive: true}, (eventType, fileName) => {
    //Only recompile for matching files
    if(filePattern.test(fileName)) {
        //Stop the recompile event if another recent file change triggered it
        clearTimeout(triggerEvent);

        //Queue the recompile event
        triggerEvent = setTimeout(() => {
            const match = filePattern.exec(fileName);
            const module = match[1];
            console.log("Recompiling module: " + module + "...");
            exec("cd src/node_modules/" + module + " && npm run compile", (err, stdout, stderr) => {
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
