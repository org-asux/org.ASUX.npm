#!/usr/bin/env node

// echo Correct way to invoke $0 is via the command: npm uninstall asux
// rm -rf ~/.org.ASUX

var fs = require("fs"); 			// https://nodejs.org/api/fs.html#fs_fs_accesssync_path_mode
var os = require('os');				// https://nodejs.org/api/os.html

// fs.rmdirSync( os.homedir() +"/.org.ASUX", {"maxRetries": 1, "recursive": true, "retryDelay": 5000 } );
    // Error: ENOTEMPTY: directory not empty, rmdir '/Users/admin/.org.ASUX'
    //     at Object.fs.rmdirSync (fs.js:821:3)

var deleteFolderRecursive = function(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

deleteFolderRecursive( os.homedir() +"/.org.ASUX" );

//EOF