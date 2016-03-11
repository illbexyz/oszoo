const rfbConnection = require('rfb2');
const jpeg = require('jpeg-js');
const PNG = require('pngjs').PNG;
const Rx = require('rx');
import fs from 'fs';
import toArray from 'stream-to-array';

// Start a new connection with the qemu process
const rfbHandler = ({ socket, port, onInit }) => {
  let rfb = undefined;

  function renderFrame(rect, quality) {
    const frameData = new Buffer(rect.width * rect.height * 4);
    let i = 0;
    while (i < frameData.length) {
      frameData[i] = rect.data[i + 2]; // red
      frameData[i + 1] = rect.data[i + 1]; // green
      frameData[i + 2] = rect.data[i]; // blue
      i += 4;
    }
    frameData
      .pipe(new PNG())
      .on('parsed', function() {
        console.log(this.pack());
        console.log(this.pack());
      });
    // const rawImageData = {
    //   data: frameData,
    //   width: rect.width,
    //   height: rect.height,
    // };
    // const imageData = jpeg.encode(rawImageData, quality);
    // return {
    //   x: rect.x,
    //   y: rect.y,
    //   width: imageData.width,
    //   height: imageData.height,
    //   image: imageData.data,
    // };
  }

  function sendFrameToClient(frame) {
    socket.emit('frame', frame);
  }

  function handleFrames() {
    // const frameObs = Rx.Observable.fromEvent(rfb, 'rect')
    //   .filter(rect => rect.width >= 50 || rect.height >= 50)
    //   .map(rect => {
    //     console.log(rect.width, rect.height);
    //     return rect;
    //   })
    //   .map(rect => renderFrame(rect, 30));
    // frameObs.subscribe(sendFrameToClient);
    rfb.on('rect', (rect) => {
      const frameData = new Buffer(rect.width * rect.height * 4);
      let i = 0;
      while (i < frameData.length) {
        frameData[i] = rect.data[i + 2]; // red
        frameData[i + 1] = rect.data[i + 1]; // green
        frameData[i + 2] = rect.data[i]; // blue
        i += 4;
      }
      const newfile = new PNG({ width: rect.width, height: rect.height });
      for (let y = 0; y < newfile.height; y++) {
        for (let x = 0; x < newfile.width; x++) {
          const idx = (newfile.width * y + x) << 2;

          // let col = x < (newfile.width >> 1) ^ y < (newfile.height >> 1) ? 0xe5 : 0xff;

          newfile.data[idx] = rect.data[idx + 2];
          newfile.data[idx + 1] = rect.data[idx + 1];
          newfile.data[idx + 2] = rect.data[idx + 0];
          newfile.data[idx + 3] = 0xff;
        }
      }
      const convertedData = new Buffer(rect.width * rect.height * 4);
      toArray(newfile.pack(), (err, array) => {
        socket.emit('frame', {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          image: array,
        });
      });
    });
  }

  function start() {
    socket.emit('init');
    rfb = rfbConnection.createConnection({
      host: '127.0.0.1',
      port,
    });
    socket.on('mouse', (data) => {
      rfb.pointerEvent(data.x, data.y, data.isButton1Down);
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
