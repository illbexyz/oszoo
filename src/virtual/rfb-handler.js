const rfbConnection = require('rfb2');
const jpeg = require('jpeg-js');

// Start a new connection with the qemu process
const rfbHandler = ({ socket, port, onInit }) => {
  let initialized = false;
  let rfb = undefined;

  function initCanvas(rect) {
    onInit();
    socket.emit('init', {
      width: rect.width,
      height: rect.height,
    });
    initialized = true;
  }

  function handleFrames() {
    rfb.on('rect', (rect) => {
      if (!initialized) {
        initCanvas(rect);
      }
      // console.log(rfb);
      // if (rect.encoding === rfb.encodings.raw) {
        // rect.x, rect.y, rect.width, rect.height, rect.data
        // pixmap format is in r.bpp, r.depth, r.redMask, greenMask,
        // blueMask, redShift, greenShift, blueShift
      const rgb = new Buffer(rect.width * rect.height * 3);
      let i = 0;
      let o = 0;
      while (i < rect.data.length) {
        rgb[o++] = rect.data[i + 2];
        rgb[o++] = rect.data[i + 1];
        rgb[o++] = rect.data[i];
        i += 4;
      }
      const imageData = jpeg.encode(rgb, 100);
      // console.log(imageData, socket.connected);
      if (imageData && socket.connected) {
        socket.emit('frame', {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          image: imageData.data,
        });
      }
      // }
    });
  }

  function start() {
    socket.emit('init');
    rfb = rfbConnection.createConnection({
      host: '127.0.0.1',
      port,
    });
    socket.on('mouse', (data) => {
      rfb.pointerEvent(data.x, data.y, data.isDown);
    });
    socket.on('keydown', (data) => {
      rfb.keyEvent(data.key, data.keydown);
    });
    handleFrames();
  }

  // Stop the current connection and cleanup event listeners
  function stop() {
    socket.removeAllListeners('keydown');
    socket.removeAllListeners('mouse');
    rfb.end();
  }

  return {
    start,
    stop,
  };
};

module.exports = ({ socket, port, onInit }) => rfbHandler({ socket, port, onInit });
