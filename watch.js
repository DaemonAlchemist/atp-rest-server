/**
 * Created by Andy on 9/5/2017.
 */

const fs = require('fs');
const {exec} = require('child_process');
const spawn = require('cross-spawn');
const process = require('process');
const Promise = require('promise');
const {f} = require('atp-sugar');

//Set delay check starting the recompile (PHPStorm tends to fire multiple file changes events in quick bursts)
const config = {
    watcher: {
        delay: 0.5,
        moduleDir: "lib/node_modules",
        compileCmd: "npm run compile"
    }
};

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

const compile = (path, name, deleteNodeModules = false) => new Promise((resolve, reject) => {
    console.log("Compiling module: " + name + "...");
    const cmd = config.watcher.compileCmd + (deleteNodeModules ? " && rm -rf node_modules" : "");
    exec(cmd, {cwd: path}, (err, stdout, stderr) => {
        if(stderr.length > 0) {
            console.log("Module " + name + " FAILED to recompile:");
            console.log(stderr);
            reject();
        } else {
            console.log("Module " + name + " recompiled");
            resolve();
        }
    });
});

//Get all installed modules
fs.readdir(config.watcher.moduleDir, (err, files) => {
    //Compile everything before starting the server
    Promise.all(
        files.map(module => compile(config.watcher.moduleDir + "/" + module, module, true))
        .concat(compile('.', 'main', false))
    ).then(() => {
        //Start the server
        restart();

        //Watch for file changes
        let appCompileEvents = {};
        files.map(module => ({name: module, dir: config.watcher.moduleDir + "/" + module}))
            .concat({name: 'main', dir: '.'})
            .forEach(module => {
                console.log("Watching for file changes in " + module.name + " (" + module.dir + "/src) ...");
                try {
                    appCompileEvents[module.name] = f(() => {
                        compile(module.dir, module.name, false).then(restart);
                    }).delay();
                    fs.watch(module.dir + "/src", {recursive: true}, () => {
                        appCompileEvents[module.name].runIn(config.watcher.delay).seconds();
                    });
                } catch (e) {
                    console.log(e);
                }
            });
    });
});
