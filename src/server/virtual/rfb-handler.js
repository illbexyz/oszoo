import rfbConnection from 'rfb2';
import streamToArray from 'stream-to-array';
import { EventEmitter } from 'events';
import { PNG } from 'pngjs';
import {
  EV_KEYDOWN, EV_MOUSEMOVE,
  EV_RESIZE, EV_FRAME,
} from '../constants/socket-events';

const handler = ({ port, emitter }) => {
  let rfb;

  function adjustFormat(rect) {
    let r = {};
    if (rect.encoding === rfbConnection.encodings.raw) {
      r = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        image: rect.data,
      };
    } else {
      r = null;
    }
    return r;
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
    return png.pack();
  }

  function streamToString(pngStream) {
    return new Promise(resolve => {
      streamToArray(pngStream)
        .then(parts => {
          const buffers = [];
          for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            buffers.push((part instanceof Buffer) ? part : new Buffer(part));
          }
          resolve(Buffer.concat(buffers).toString('base64'));
        });
    });
  }

  function sendFrameToClient(frame) {
    if (frame) {
      emitter.emit(EV_FRAME, frame);
    }
  }

  function start() {
    rfb = rfbConnection.createConnection({
      host: '127.0.0.1',
      port,
    });

    rfb.on('connect', () => {
      emitter.on(EV_MOUSEMOVE, data => {
        rfb.pointerEvent(data.x, data.y, data.isButton1Down);
      });
      emitter.on(EV_KEYDOWN, data => {
        rfb.keyEvent(data.key, data.keydown);
      });

      rfb.on('rect', rect => {
        const r = adjustFormat(rect);
        if (r) {
          const imageStream = packPNG(r);
          streamToString(imageStream)
            .then(imgBase64 => {
              sendFrameToClient({
                ...r,
                image: imgBase64,
              });
            });
        }
      });
    });
    rfb.on('resize', rect => {
      emitter.emit(EV_RESIZE, rect);
    });
    rfb.on('error', error => {
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
    emitter.removeAllListeners(EV_KEYDOWN);
    emitter.removeAllListeners(EV_MOUSEMOVE);
    rfb.end();
  }

  return {
    start,
    stop,
    emitter,
  };
};

const rfbHandler = (port) => handler({ port, emitter: Object.assign({}, EventEmitter.prototype) });

export default rfbHandler;
