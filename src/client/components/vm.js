import React, { Component, PropTypes } from 'react';

import Paper from 'material-ui/lib/paper';

import keysymsConvert from '../utils/keysyms';

const style = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};

export default class Vm extends Component {

  static propTypes = {
    lastFrame: PropTypes.object,
    sendKeydown: PropTypes.func.isRequired,
    sendMouseMove: PropTypes.func.isRequired,
    sendMouseDown: PropTypes.func.isRequired,
    sendMouseUp: PropTypes.func.isRequired,
    isRunning: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.canvas = document.querySelector('.vm-screen');
    this.ctx = this.canvas.getContext('2d');
    this.firstFrame = 0;
    document.addEventListener(
      'keydown',
      event => {
        if (this.props.isRunning) {
          this.props.sendKeydown(keysymsConvert(event.keyCode));
        }
      }
    );
    this.canvas.addEventListener(
      'mousemove',
      event => {
        if (this.props.isRunning) {
          this.props.sendMouseMove({
            x: event.clientX,
            y: event.clientY,
          });
        }
      }
    );
    this.canvas.addEventListener(
      'mousedown',
      () => this.props.sendMouseDown()
    );
    this.canvas.addEventListener(
      'mouseup',
      () => this.props.sendMouseUp()
    );
  }

  canvasNeedsToBeResized(width, height) {
    if (width === 640 && height === 480
      || width === 800 && height === 600
      || width === 1024 && height === 768
      || width === 1280 && height === 720) {
      return true;
    }
    return false;
  }

  resizeCanvas(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  updateFrame(data) {
    const image = new Image();
    const uInt8Array = new Uint8Array(data.image);
    let i = uInt8Array.length;
    const binaryString = [i];
    while (i--) {
      binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    const bdata = binaryString.join('');
    const base64 = window.btoa(bdata);
    if (this.canvasNeedsToBeResized(data.width, data.height)) {
      this.resizeCanvas(data.width, data.height);
    }
    image.src = `data:image/jpeg;base64,${base64}`;
    if (this.firstFrame < 2) {
      this.firstFrame++;
    }
    image.onload = () => {
      this.ctx.drawImage(image, data.x, data.y, data.width, data.height);
    };
  }

  render() {
    if (this.props.lastFrame) {
      this.updateFrame(this.props.lastFrame);
    }
    return (
      <Paper style={style} zDepth={1}>
        <canvas className="vm-screen">
        </canvas>
      </Paper>
    );
  }
}
