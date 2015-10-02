var spawn = require('child_process').spawn;
var randomstring = require("randomstring");

var method = Qemu.prototype;

function Qemu(){
	this._vncPorts = [];
	this._vncActivePorts = [];
	this._qemu = null;
	for(var i=0; i<=50; i++) this._vncPorts.push(i);
}

method.start = function(exe, memory, image, callback){
	var executable = exe;
	var password = randomstring.generate({length: 12});
	var port = this._port();
	var self = this;
	var args = [
		'-m', memory,
		'-hda', 'img/' + image,
		'-cdrom', 'iso/finnix-111.iso',
		'-vnc', ":" + port
	];
	this._qemu = spawn(executable, args);
	this._qemu.on('exit', function(){
		self._reallocatePort(port);
	});
	console.log(args);
	setTimeout(function () {
		callback(null, port, password);
	}, 1000);
}

method.stop = function(port) {
	this._qemu.kill();
}

method._reallocatePort = function(port) {
	console.log("port " + port + " reallocated");
	this._vncPorts.push(port);
	var index = this._vncActivePorts.indexOf(5);
	if(index > -1){
		this._vncActivePorts.splice(index, 1);
	}
}

method._port = function() {
	var port = this._vncPorts.pop();
	this._vncActivePorts.push(port);
	return port;
}

var qemu = new Qemu();

module.exports = qemu;