import rfbConnection from 'rfb2';
import { PNG } from 'pngjs';
import Rx from 'rx';
import streamToArray from 'stream-to-array';

// Start a new connection with the qemu process
const rfbHandler = ({ socket, port }) => {
  let rfb;

  function adjustFormat(rect) {
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      image: rect.data,
    };
  }

  function packPNG(image) {
    const png = new PNG({ width: image.width, height: image.height });
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const idx = (png.width * y + x) << 2;
        png.data[idx] = image.image[idx + 2];
        png.data[idx + 1] = image.image[idx + 1];
        png.data[idx + 2] = image.image[idx + 0];
        png.data[idx + 3] = 0xff;
      }
    }
    return {
      ...image,
      image: png.pack(),
    };
  }

  function streamToString(pngStream) {
    return new Promise((resolve) => {
      streamToArray(pngStream.image)
        .then(parts => {
          const buffers = [];
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            buffers.push((part instanceof Buffer) ? part : new Buffer(part));
          }
          resolve({
            ...pngStream,
            image: Buffer.concat(buffers).toString('base64'),
          });
        });
    });
  }

  function sendFrameToClient(frame) {
    socket.emit('frame', frame);
  }

  function start() {
    socket.emit('init');

    rfb = rfbConnection.createConnection({
      host: '127.0.0.1',
      port,
    });

    rfb.on('connect', () => {
      socket.on('mouse', (data) => {
        rfb.pointerEvent(data.x, data.y, data.isButton1Down);
      });
      socket.on('keydown', (data) => {
        rfb.keyEvent(data.key, data.keydown);
      });
      Rx.Observable.fromEvent(rfb, 'rect')
        .map(adjustFormat)
        .map(packPNG)
        .flatMap(streamToString)
        .subscribe(sendFrameToClient);
    });
    rfb.on('resize', (rect) => {
      socket.emit('resize', rect);
    });
    rfb.on('error', (error) => {
      if (error.code === 'ECONNREFUSED') {
        setTimeout(() => {
          start();
        }, 100);
      } else {
        throw new Error(error);
      }
    });
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

export default rfbHandler;
