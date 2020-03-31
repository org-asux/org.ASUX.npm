#!/usr/bin/env node

// https://github.com/umdjs/umd/
// https://github.com/umdjs/umd/blob/master/templates/commonjsStrict.js

// Uses CommonJS, AMD or browser globals to create a module.

// If you just want to support Node, or other CommonJS-like environments that
// support module.exports, and you are not creating a module that has a
// circular dependency, then see returnExports.js instead. It will allow
// you to export a function as the module value.

// Defines a module "commonJsStrict" that depends another module called "b".
// Note that the name of the module is implied by the file name. It is best
// if the file name and the exported global have matching names.

// If the 'b' module also uses this type of boilerplate, then
// in the browser, it will create a global .b that is used below.

// If you do not want to support the browser global path, then you
// can remove the `root` use and the passing `this` as the first arg to
// the top function.

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
		define(['exports', 'os'], factory);			// https://nodejs.org/api/os.html
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
		factory(exports, require('os'));		// https://nodejs.org/api/os.html
    } else {
        // Browser globals
        factory((root.commonJsStrict = {}), root.os);
	}

}(typeof self !== 'undefined' ? self : this, function (exports, b) {

	// now that you have "required" 'os'/'path' above .. 
	// .. Use them in some fashion, below.

	//============================================================================
	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	//============================================================================

	/** 
	*	Switch to the FOLDER "cwd" (param #1)
	*	Exec "command" (param #2)
	*	cmdline arguments to pass to the "command" (param #3 is an array)
	*	true/false whether the OUTPUT of the "command" is dumped to console. (param #4)
	*	true/false whether THIS function is verbose.  Do NOT use the global process.env.VERBOSE. (param #5)
	*	true/false whether any failure should lead to an actual call to Process.EXIT(...) (param #6)
	*/
	const executeSharingSTDOUT =
	function( _newWorkingDir, _command, _cmdArgs, _quietlyRunCmd, _bVerbose2, _bExitOnFail, env ) {

		if (_bVerbose2) { console.log( `${__filename} : about to run command.  "${_command}" with cmdline arguments: ` + _cmdArgs.join(' ') ); }
		const CHILD_PROCESS = require('child_process'); // https://nodejs.org/api/child_process.html#child_process_class_childprocess

		//----------------------
		try { // synchornous version of Javascript's child_process.execFile(...)
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Deep_Clone
			var envClone = (env != null) ? env : JSON.parse( JSON.stringify( process.env ) );
			const cpObj = CHILD_PROCESS.spawnSync( _command, _cmdArgs, { cwd: _newWorkingDir, stdio: 'inherit', timeout: 0, env: envClone } );
			if ( cpObj.status == null ) {
				if ( cpObj.error != null ) {
					console.log( "!! ERROR in "+ __filename +"\nFailed to run the command '"+ _command +"' from within the folder '"+ _newWorkingDir +"'\n\nSpawnSync()'s return ERROR-Object's DETAILS =\n"+ JSON.stringify(cpObj.error) +"\n" );
					cpObj.status = 1;
				} else {
					console.log( "!! ERROR in "+ __filename +"\n__UNKNOWN__ SERIOUS INTERNAL FAILURE running command '"+ _command +"' from within the folder '"+ _newWorkingDir +"'\nBoth status and error of cpObj are NULL!\n"+ JSON.stringify(cpObj) );
					cpObj.status = 1;
				}
			}
			if (_bVerbose2) console.log( "Within"+ __filename +"\nRunning '"+ _command +"' gave cpObj.status=" + cpObj.status +" .... and cpObj="+ JSON.stringify(cpObj) +" .... and ERROR-ATTR="+ JSON.stringify(cpObj.error) );

			if ( ! _quietlyRunCmd ) {
				if (_bVerbose2) console.log( `${__filename} : about to dump output from command (code=${cpObj.status}))` +"\n@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@\n");
				if ( cpObj.stdout ) console.log(cpObj.stdout);
				if ( cpObj.stderr ) console.log(cpObj.stderr);
			};
			return(cpObj.status);
		} catch (errObj5) {
			console.error( "!! ERROR in "+ __filename +"\nException-thrown/Error running command ["+ _command + "].  Exit code = "+ errObj5.code +"\n" + errObj5.toString());
			if ( _bExitOnFail ) process.exit( errObj5.code );
			else return(errObj5.code);
		}

		if (_bVerbose2) console.log( `${__filename} : DONE FINISHED command.  ${_command}` );
	}

	//============================================================================
	//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
	//============================================================================

	// UMD: Only attach properties to the exports object to define the module's properties.
	/**
	 * Pass one or more arguments just as you'd pass command line arguments ~/.org.asux/
	 */
    exports.action = function ( _argv ) {

		//======================================
		//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		//======================================
		var os = require('os');     // https://nodejs.org/api/os.html

		// const INITIAL_CWD = process.cwd(); // just in case I mistakenly process.chdir() somewhere below.
		const ORGNAME="org-asux";
		const PROJNAME="org.ASUX";
		const ACTUALSCRIPT="asux.js";
		process.env.ORGASUXHOME=os.homedir() + "/.org.asux";

		// in contrast with bin/asux this file (bin/asux_module.js) is a simple wrapper to invoke the asux.js script in process.env.ORGASUXHOME

		//------------------------------------------------
		// if everything is ok.. let's run the commands..
		if (process.env.VERBOSE) { console.log( `${__filename} : started off with node ` + _argv.join(' ') ); }
		const is1stCmdLineArgNodeExecutable = _argv[0].match('.*node(.exe)?$');
		const cmdArgs = _argv.slice( is1stCmdLineArgNodeExecutable ? 2: 1 ); // get rid of BOTH 'node' and this script
		if (process.env.VERBOSE) { console.log( process.env.ORGASUXHOME+ '/'+ ACTUALSCRIPT +' '+ cmdArgs.join(' ') ); }

		// run ./install shell-script within the Git-downloaded project, which checks for everything
		const retCode3 = executeSharingSTDOUT ( process.env.ORGASUXHOME, ACTUALSCRIPT, cmdArgs, true, process.env.VERBOSE, true, process.env );
		if(retCode3 != 0){
				// User's command FAILED. Now try to write out the ERROR, so user can use it to report an issue/bug
				console.error( "\n"+ __filename +": Internal error running '"+ process.env.ORGASUXHOME +'/'+ ACTUALSCRIPT +' '+ cmdArgs.join(' ') +"\n\tPlease contact the project owner, with the above output\n\n");
			process.exit(99);
		}

		//============================================================================
		//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		//============================================================================

	}; // UMD exports.action definition ends here

})); // UMD-definition ends here



//EOF
