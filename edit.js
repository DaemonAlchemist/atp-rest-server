/**
 * Created by awittrock on 10/17/2017.
 */

const fs = require('fs');
const {execSync} = require('child_process');
const rimraf = require('rimraf');

const moduleName = process.argv[2];
const editDir = "./lib/node_modules/" + moduleName;

console.log(moduleName);

//Delete any existing module from ./lib/node_modules
rimraf.sync(editDir);

//Install default module into ./node_modules
execSync('npm install ' + moduleName);

//Read repo location from default module
const config = require("./node_modules/" + moduleName + "/package.json");
const repoUrl = config.repository.url;
console.log(repoUrl);

//Checkout repo into ./lib/node_modules
execSync("git clone " + repoUrl + " .", {cwd: editDir})
