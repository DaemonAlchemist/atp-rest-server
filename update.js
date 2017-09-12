/**
 * Created by Andy on 9/11/2017.
 */

const fs = require('fs');
const {exec} = require('child_process');
const Promise = require('promise');

console.log("");
exec("git pull", () => {});

fs.readdir("lib/node_modules", (err, files) => {
    Promise.all(files.map(moduleName => new Promise((resolve, reject) => {
        exec("git pull", {cwd: "lib/node_modules/" + moduleName}, (err, stdout, stderr) => {
            console.log(moduleName + ": " + stdout);
            resolve();
        });
    }))).then(() => {
        console.log("");
    });
});
