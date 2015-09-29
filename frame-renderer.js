var rfb = require('rfb2');
var Jpeg = require('jpeg').Jpeg;

var method = FrameRenderer.prototype;

function FrameRenderer(socket, port, password){
	this._socket = socket;
	this._port = port;
	this._password = password;
	this._rfb = rfb.createConnection({
	  host: '127.0.0.1',
	  port: port,
	  password: password
	});
	this._imageStack = new FixedJpegStack(this.width, this.height, 'rgb');
	handleFrames();
}

function handleFrames(){
	this._rfb.on('rect', function(rect) {
	   switch(rect.encoding) {
	   case rfb.encodings.raw:
	      // rect.x, rect.y, rect.width, rect.height, rect.data
	      // pixmap format is in r.bpp, r.depth, r.redMask, greenMask, blueMask, redShift, greenShift, blueShift
	      var rgb = new Buffer(rect.width * rect.height * 3);
 
		  for (var i = 0, o = 0; i < rect.data.length; i += 4) {
		    rgb[o++] = rect.data[i + 2];
		    rgb[o++] = rect.data[i + 1];
		    rgb[o++] = rect.data[i];
		  }

		  var self = this;
		  var image = new Jpeg(rgb, rect.width, rect.height, 'rgb');
		  image.encode(function(img, err){
		    if (img) self._socket.emit('raw', {
		      x: rect.x,
		      y: rect.y,
		      width: rect.width,
		      height: rect.height,
		      image: img
		    });
		  });
		   
		  this._imageStack.push(rgb, rect.x, rect.y, rect.width, rect.height);

		  this._imageStack.encode(function(img, err) {
		    if (img) self._socket.emit('frame', img);
		  });
		  break;
	   //case rfb.encodings.copyRect:
	      // pseudo-rectangle
	      // copy rectangle from rect.src.x, rect.src.y, rect.width, rect.height, to rect.x, rect.y
	  }
	});
}

module.export = FrameRenderer;