var url = 'http://localhost:3000';

document.addEventListener("DOMContentLoaded", function() {
	var socket = io.connect(url);

	var canvas = document.getElementById('screen');

	var ctx = canvas.getContext('2d');
	//socket.emit('startQemu', {});

	socket.on('init', function(data){
		canvas.width = data.width;
		canvas.height = data.height;
	});

	socket.on('frame', function (data) {
		var image = new Image();
		var blob = new Blob([data.image], {type: 'image/jpeg'});
		var urlBlob = URL.createObjectURL(blob);

		var uInt8Array = new Uint8Array(data.image);
	    //var uInt8Array = imgData;
	    var i = uInt8Array.length;
	    var binaryString = [i];
	    while (i--) {
	        binaryString[i] = String.fromCharCode(uInt8Array[i]);
	    }
	    var bdata = binaryString.join('');

	    var base64 = window.btoa(bdata);

		image.src = 'data:image/jpeg;base64,' + base64;
		image.onload = function() {
			ctx.drawImage(image, data.x, data.y, data.width, data.height);
		}
	});

	document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        socket.emit('mouse', {x: event.pageX, y: event.pageY});
    }

    document.addEventListener('keydown', handleKeydown);
    function handleKeydown(event){
    	socket.emit('keydown', {key: codeConvert(event.keyCode)});
    }

});