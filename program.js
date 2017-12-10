const http = require("http");
const exec = require("child_process").exec;
const path = require("path");
const async = require("async");

const projectPath = process.argv[2];
const absolutePath = path.join(__dirname, projectPath);

var cmdsfet = ["git fetch"].concat(process.argv.filter((arg, index) => { return index > 2; }));
var cmdspul = ["git pull"].concat(process.argv.filter((arg, index) => { return index > 2; }));

const execCmdsfet = cmdsfet.map((cmd) => {
	return function(callback) {
		exec(`cd ${absolutePath} && ${cmd}`, {maxBuffer: 1024 * 600}, (err, stdout, stderr) => {
			if(err) { return callback(err); }
			else if(stdout == "Already up-to-date.\n") { callback(false); }
			else {
				callback(null, `--- ${cmd} ---:\n stdout: ${stdout} \n stderr: ${stderr}\n`);
			}
		});
	};
});
const execCmdspul = cmdspul.map((cmd) => {
	return function(callback) {
		exec(`cd ${absolutePath} && ${cmd}`, {maxBuffer: 1024 * 600}, (err, stdout, stderr) => {
			if(err) { return callback(err); }
			else if(stdout == "Already up-to-date.\n") { callback(false); }
			else {
				callback(null, `--- ${cmd} ---:\n stdout: ${stdout} \n stderr: ${stderr}\n`);
			}
		});
	};
});

const updateProject = function(callback) {
	async.series(execCmdsfet,
		function(err, results) {
			if(err) { return callback(err); }
			else if(err === false) { return callback(false); }
			else {
				async.series(execCmdspul,
					function(err, results) {
						if(err) { return callback(err); }
						else if(err == false) { return callback(false); }
						else { return callback(null, results.join("")); }
					}
				);
			}
		}
	);
};

function update() {
	updateProject((e, result) => {
		let response = "";
		if(e) {
			console.error(`exec error: ${e}`);
			response += `exec error: ${e}`;
			console.log(response);
		}
		if(result && e != false) {
			console.log(result);
			response += `\n ${result}`;
			console.log(response);
		}
	});
}

setInterval(update, 10000);

console.log("Git-auto-pull is running");
