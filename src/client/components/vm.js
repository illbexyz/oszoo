import React, { Component, PropTypes } from 'react';

import Paper from 'material-ui/lib/paper';

import keysymsConvert from '../utils/keysyms';

const style = {
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  alignItems: 'center',
  padding: 16,
};

export default class Vm extends Component {

  static propTypes = {
    size: PropTypes.object,
    lastFrame: PropTypes.object,
    sendKeydown: PropTypes.func.isRequired,
    sendKeyup: PropTypes.func.isRequired,
    sendMouseMove: PropTypes.func.isRequired,
    sendMouseDown: PropTypes.func.isRequired,
    sendMouseUp: PropTypes.func.isRequired,
    isRunning: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.onKeyUp = this.keyUpListener.bind(this);
    this.onKeyDown = this.keyDownListener.bind(this);
    this.onMouseMove = this.mouseMoveListener.bind(this);
    this.onMouseUp = this.mouseUpListener.bind(this);
    this.onMouseDown = this.mouseDownListener.bind(this);
  }

  componentDidMount() {
    this.canvas = document.querySelector('.vm-screen');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.requestPointerLock = this.canvas.requestPointerLock
      || this.canvas.mozRequestPointerLock
      || this.canvas.webkitRequestPointerLock;

    document.exitPointerLock = document.exitPointerLock
      || document.mozExitPointerLock
      || document.webkitExitPointerLock;
    document.addEventListener('pointerlockchange', this.lockChangeAlert.bind(this), false);
    document.addEventListener('mozpointerlockchange', this.lockChangeAlert.bind(this), false);
    document.addEventListener('webkitpointerlockchange', this.lockChangeAlert.bind(this), false);
    this.canvas.addEventListener('dblclick', () => {
      if (this.canvas.requestFullScreen) {
        this.canvas.requestFullScreen();
      } else if (this.canvas.webkitRequestFullScreen) {
        this.canvas.webkitRequestFullScreen();
      } else if (this.canvas.mozRequestFullScreen) {
        this.canvas.mozRequestFullScreen();
      }
    });
    this.canvas.onclick = () => {
      this.canvas.requestPointerLock();
    };
  }

  componentWillReceiveProps(newProps) {
    const currentWidth = this.props.size.width;
    const currentHeight = this.props.size.height;
    const newWidth = newProps.size.width;
    const newHeight = newProps.size.height;
    if (!newProps.isRunning && this.props.isRunning) {
      this.clearCanvas();
    }
    if (newWidth !== currentWidth
    || newHeight !== currentHeight) {
      if (this.canvas) {
        if (newWidth < currentWidth) {
          this.ctx.clearRect(newWidth, 0, currentWidth - newWidth, currentHeight);
        }
        if (newHeight < currentHeight) {
          this.ctx.clearRect(newHeight, 0, currentHeight - newHeight, currentHeight);
        }
      }
    }
    if (newProps.lastFrame !== this.props.lastFrame) {
      this.updateFrame(newProps.lastFrame);
    }
  }

  updateFrame(data) {
    const image = new Image();
    const base64 = data.image;
    image.src = `data:image/png;base64,${base64}`;
    image.onload = () => {
      this.ctx.drawImage(image, data.x, data.y, data.width, data.height);
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  keyDownListener(e) {
    if (this.props.isRunning) {
      if (e.keyCode === 8 || e.keyCode === 37
        || e.keyCode === 38 || e.keyCode === 39
        || e.keyCode === 40) {
        e.preventDefault();
      }
      this.props.sendKeydown(keysymsConvert(e.keyCode));
    }
  }

  keyUpListener(e) {
    if (this.props.isRunning) {
      if (e.keyCode === 8 || e.keyCode === 37
        || e.keyCode === 38 || e.keyCode === 39
        || e.keyCode === 40) {
        e.preventDefault();
      }
      this.props.sendKeyup(keysymsConvert(e.keyCode))
    }
  }

  mouseMoveListener(event) {
    if (this.props.isRunning) {
      this.props.sendMouseMove({
        x: event.movementX,
        y: event.movementY,
      });
    }
  }

  mouseDownListener() {
    this.props.sendMouseDown();
  }

  mouseUpListener() {
    this.props.sendMouseUp();
  }

  lockChangeAlert() {
    if (document.pointerLockElement === this.canvas
        || document.mozPointerLockElement === this.canvas
        || document.webkitPointerLockElement === this.canvas) {
      document.addEventListener('keydown', this.onKeyDown);
      document.addEventListener('keyup', this.onKeyUp);
      this.canvas.addEventListener('mousemove', this.onMouseMove);
      this.canvas.addEventListener('mousedown', this.onMouseDown);
      this.canvas.addEventListener('mouseup', this.onMouseUp);
    } else {
      document.removeEventListener('keydown', this.onKeyDown);
      document.removeEventListener('keyup', this.onKeyUp);
      this.canvas.removeEventListener('mousemove', this.onMouseMove);
      this.canvas.removeEventListener('mousedown', this.onMouseDown);
      this.canvas.removeEventListener('mouseup', this.onMouseUp);
    }
  }

  render() {
    return (
      <canvas
        className="vm-screen"
        width={this.props.size.width}
        height={this.props.size.height} >
      </canvas>
    );
  }
}
