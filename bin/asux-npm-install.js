#!/usr/bin/env node

var fs = require("fs");     // https://nodejs.org/api/fs.html#fs_fs_accesssync_path_mode 
var os = require('os');     // https://nodejs.org/api/os.html

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

// const INITIAL_CWD = process.cwd(); // just in case I mistakenly process.chdir() somewhere below.
const ORGNAME="org-asux";
const PROJNAME="org.ASUX";
const ACTUALSCRIPT="asux.js";
process.env.ORGASUXHOME=os.homedir() + "/.org.ASUX";

//-------------------------------------------------------
try {
	if (process.env.VERBOSE) console.log( `\nchecking if ${process.env.ORGASUXHOME} exists or not.. .. ` );
	fs.accessSync( process.env.ORGASUXHOME, fs.constants.R_OK | fs.constants.X_OK );
} catch (err5) { // a.k.a. if fs.accessSync throws
	// if (process.env.VERBOSE) console.log( err5 );
	console.log( '\n\t1st time !!!\n' );

	try {
		// if (process.env.VERBOSE) console.log( `mkdir ${process.env.ORGASUXHOME} .. .. ` );
		// fs.mkdirSync ( process.env.ORGASUXHOME,  {recursive: true, mode: 0o755} );

		//-------------------------------------------------------
		// run git clone https://github.com/org-asux/org.ASUX.git
		var gitpullcmdArgs = ['clone', `https://github.com/${ORGNAME}/${PROJNAME}`];
		console.log( 'git '+ gitpullcmdArgs.join(' ') );

		// use git to get the code for the top-level project
		const retCode1 = executeSharingSTDOUT ( os.homedir(), 'git', gitpullcmdArgs, true, process.env.VERBOSE, true, process.env );
		if(retCode1 != 0){
				// 'git clone' command FAILED. Now try to write out the ERROR, so user can use it to report an issue/bug
				console.error( "\n"+ __filename +": Internal error running 'git' command: Please contact the project owner, with the above output\n\n" );
			process.exit(12);
		}

		//---------------------------
		if (process.env.VERBOSE) console.log( `renaming ASUX.org folder to ${process.env.ORGASUXHOME} .. .. ` );
		const retCode2 = executeSharingSTDOUT ( os.homedir(), '/bin/mv', [ PROJNAME, process.env.ORGASUXHOME ], true, process.env.VERBOSE, true, process.env );
		if(retCode2 != 0){
				// 'git clone' command FAILED. Now try to write out the ERROR, so user can use it to report an issue/bug
				console.error( "\n"+ __filename +": Internal error running 'mv ./org.ASUX/* .' command: Please contact the project owner, with the above output\n\n" );
			process.exit(14);
		}

		// if (process.env.VERBOSE) console.log( `removing empty ${process.env.ORGASUXHOME}/ASUX.org folder .. .. ` );
		// fs.rmdirSync( process.env.ORGASUXHOME +"/org.ASUX", {"maxRetries": 0, "recursive": false, "retryDelay": -1 } );
		// 	// no retries.  The folder should be empty.  If not, check the arguments passed to 'mv' command in the above 'executeSharingSTDOUT()' invocation

		//---------------------------
		// run ./install shell-script within the Git-downloaded project, which checks for everything
		if (process.env.VERBOSE) { console.log( `${__filename} : running ${process.env.ORGASUXHOME}/install ` ); }
		const retCode4 = executeSharingSTDOUT ( process.env.ORGASUXHOME, './install', [], false, process.env.VERBOSE, true, process.env );
		if(retCode4 != 0){
				// './install' command FAILED. Now try to write out the ERROR, so user can use it to report an issue/bug
				console.error( "\n"+ __filename +": Internal error running '"+ process.env.ORGASUXHOME +"/install' command: Please contact the project owner, with the above output\n\n" );
			process.exit(31);
		}

	} catch (err8) { // a.k.a. if fs.mkdirSync throws
		console.error( __filename +": Internal failure, creating the folder ["+ process.env.ORGASUXHOME +"]\n"+ err8.toString() );
		process.exit(10);
	}

} // try-catch err5

//------------------------------------------------
// if everything is ok.. let's run the commands..
if (process.env.VERBOSE) { console.log( `${__filename} : started off with node ` + process.argv.join(' ') ); }
const is1stCmdLineArgNodeExecutable = process.argv[0].match('.*node(.exe)?$');
const cmdArgs = process.argv.slice( is1stCmdLineArgNodeExecutable ? 2: 1 ); // get rid of BOTH 'node' and this script
if (process.env.VERBOSE) { console.log( process.env.ORGASUXHOME+ '/'+ ACTUALSCRIPT +' '+ cmdArgs.join(' ') ); }

// run ./install shell-script within the Git-downloaded project, which checks for everything
const retCode3 = executeSharingSTDOUT ( process.env.ORGASUXHOME, './'+ ACTUALSCRIPT, cmdArgs, true, process.env.VERBOSE, true, process.env );
if(retCode3 != 0){
		// User's command FAILED. Now try to write out the ERROR, so user can use it to report an issue/bug
		console.error( "\n"+ __filename +": Internal error running '"+ process.env.ORGASUXHOME +'/'+ ACTUALSCRIPT +' '+ cmdArgs.join(' ') +"\n\tPlease contact the project owner, with the above output\n\n");
	process.exit(99);
}

//============================================================================
//@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
//============================================================================


//EOF
