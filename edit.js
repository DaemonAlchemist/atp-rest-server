/**
 * Created by awittrock on 10/17/2017.
 */

const fs = require('fs');
const {execSync} = require('child_process');
const rimraf = require('rimraf');

const moduleName = process.argv[2];
const editBaseDir = "./lib/node_modules";
const editDir = editBaseDir + "/" + moduleName;

const execOptions = {stdio: 'pipe'};

console.log("")
console.log("Setting up " + moduleName + " for editing...");

//Delete any existing module from ./lib/node_modules
console.log("-- Removing existing editable module (if any)...");
rimraf.sync(editDir);

//Install default module into ./node_modules
console.log("-- Installing module...");
execSync('npm install ' + moduleName, execOptions);

//Read repo location from default module
console.log("-- Reading repository URL...");
const config = require("./node_modules/" + moduleName + "/package.json");
const repoUrl = config.repository.url.replace(/^git\+/, "");
console.log("-- Repo URL: " + repoUrl);

//Checkout repo into ./lib/node_modules
console.log("-- Checking out module into " + editDir + "...");
execSync("mkdir " + moduleName, {cwd: editBaseDir}, execOptions);
execSync("git clone " + repoUrl + " .", Object.assign({}, execOptions, {cwd: editDir}));

console.log("-- Done.");
