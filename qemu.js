var spawn = require('child_process').spawn;
var randomstring = require("randomstring");

var method = Qemu.prototype;

function Qemu(){
	this._vncPorts = [];
	this._vncActivePorts = [];
	for(var i=0; i<=50; i++) this._vncPorts.push(i);
}

method.start = function(exe, memory, image, callback){
	var executable = exe;
	var password = randomstring.generate({length: 12});
	var port = port();
	var args = [
		'-m', memory,
		'-hda', image,
		'-vnc', ":" + port() + "," + password
	];
	var qemu = spawn(executable, args);

	qemu.stdout.on('data', function(data){
		callback(null, port, password);
	});

	qemu.stderr.on('data', function(err){
		callback(err, null, null);
	});
}

function port(){
	var port = this._vncPorts.pop();
	this._vncActivePorts.push(port);
	return port;
}

var qemu = new Qemu();

module.exports = qemu;