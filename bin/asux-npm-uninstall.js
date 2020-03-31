#!/usr/bin/env node

// echo Correct way to invoke $0 is via the command: npm uninstall asux
// rm -rf ~/.org.asux

var fs = require("fs"); 			// https://nodejs.org/api/fs.html#fs_fs_accesssync_path_mode
var os = require('os');				// https://nodejs.org/api/os.html
fs.rmdirSync( os.homedir() +"/.org.asux", {"maxRetries": 1, "recursive": true, "retryDelay": 5000 } );

//EOF