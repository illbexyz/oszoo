var spawn = require('child_process').spawn;
var randomstring = require("randomstring");

var method = Qemu.prototype;

function Qemu(){
	this._vncPorts = [];
	this._vncActivePorts = [];
	this._qemu = [];
	for(var i=0; i<=50; i++) this._vncPorts.push(i);
}

method.start = function(exe, memory, image, callback){
	console.log(image);
	var executable = exe;
	var password = randomstring.generate({length: 12});
	var port = this._port();
	var self = this;
	// var args = [
	// 	'-m', memory,
	// 	'-hda', 'img/' + image,
	// 	'-cdrom', 'iso/finnix-111.iso',
	// 	'-vnc', ":" + port
	// ];
	var args = [
		'-m', 256,
		'-hda', 'img/' + "windows3-1.vmdk",
		//'-cdrom', 'iso/finnix-111.iso',
		'-vnc', ":" + port
	];
	// var args = [
	// 	'-m', 256,
	// 	'-hda', 'img/' + "windows3-1.vmdk",
	// 	'-cdrom', 'iso/finnix-111.iso',
	// 	'-vga', 'qxl',
	// 	'-spice', 'port=' + port + ',addr=127.0.0.1,disable-ticketing'
	// ];
	this._qemu[port] = spawn(executable, args);
	this._qemu[port].on('exit', function(){
		self._reallocatePort(port);
	});
	console.log(args);
	setTimeout(function () {
		callback(null, port, password);
	}, 1000);
}

method.stop = function(port) {
	console.log("Killing qemu on port" + port);
	if(this._qemu[port]){
		this._qemu[port].kill();
	}
}

method._reallocatePort = function(port) {
	console.log("port " + port + " reallocated");
	var index = this._vncActivePorts.indexOf(port);
	if(index > -1){
		this._vncActivePorts.splice(index, 1);
		this._vncPorts.push(port);
	}
}

method._port = function() {
	var port = this._vncPorts.pop();
	this._vncActivePorts.push(port);
	return port;
}

var qemu = new Qemu();

module.exports = qemu;
