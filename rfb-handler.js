var rfb = require('rfb2');
var Jpeg = require('jpeg').Jpeg;

var method = RfbHandler.prototype;

function RfbHandler(socket, port, password){
	this._socket = socket;
	this._port = port;
	this._password = password;
	console.log(port, password);
	this._initialized = false;
}

/** Start a new connection with the qemu process */
method.start = function() {
	this._rfb = rfb.createConnection({
		host: '127.0.0.1',
		port: this._port
	});

	this._handleFrames();
	this._handleMouse();
	this._handleKeys();
}

/** Stop the current connection and cleanup event listeners */
method.stop = function(){
	this._socket.removeAllListeners('keydown');
	this._socket.removeAllListeners('mouse');
	this._rfb.end();
}


method._handleFrames = function(){
	var self = this;
	self._rfb.on('rect', function(rect) {
		if(!self._initialized) {
			self._socket.emit('init', {width: rect.width, height: rect.height});
			self._initialized = true;
		}

		if(rect.encoding == rfb.encodings.raw) {
			// rect.x, rect.y, rect.width, rect.height, rect.data
			// pixmap format is in r.bpp, r.depth, r.redMask, greenMask, blueMask, redShift, greenShift, blueShift
			var rgb = new Buffer(rect.width * rect.height * 3);

			for (var i = 0, o = 0; i < rect.data.length; i += 4) {
				rgb[o++] = rect.data[i + 2];
				rgb[o++] = rect.data[i + 1];
				rgb[o++] = rect.data[i];
			}

			var image = new Jpeg(rgb, rect.width, rect.height, 'rgb');
			image.encode(function(img, err){
				if (img && self._socket.connected) self._socket.emit('frame', {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height,
					image: img
				});
			});
		}
	});
}

method._handleMouse = function() {
	var self = this;
	self._socket.on('mouse', function(data) {
		self._rfb.pointerEvent(data.x, data.y, data.isDown);
	});
}

method._handleKeys = function() {
	var self = this;
	self._socket.on('keydown', function(data) {
		self._rfb.keyEvent(data.key, 1);
	});
}

module.exports = RfbHandler;
