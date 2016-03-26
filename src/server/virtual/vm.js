import { EventEmitter } from 'events';

import qemuFactory from '../virtual/qemu';
import rfbHandler from '../virtual/rfb-handler';

import {
  EV_STOP, EV_TIMER, RS_SESSION_EXPIRED,
  EV_FRAME, EV_RESIZE, EV_KEYDOWN, EV_MOUSEMOVE,
} from '../constants/socket-events';

import {
  x8664Executable, VM_MAX_SESSIONS, VM_MAX_TIME,
} from '../config/config';

const vm = ({ emitter }) => {
  const qemu = qemuFactory({ x8664Executable, VM_MAX_SESSIONS });
  let timerInterval = undefined;
  let rfb = undefined;

  let vmState = {
    isRunning: false,
    port: 0,
    timer: VM_MAX_TIME,
    os: {},
  };

  function handleEvents(rfbEmitter, clientEmitter) {
    rfbEmitter.on(EV_FRAME, frame => clientEmitter.emit(EV_FRAME, frame));
    rfbEmitter.on(EV_RESIZE, rect => clientEmitter.emit(EV_RESIZE, rect));
    clientEmitter.on(EV_KEYDOWN, keydown => rfbEmitter.emit(EV_KEYDOWN, keydown));
    clientEmitter.on(EV_MOUSEMOVE, mousemove => rfbEmitter.emit(EV_MOUSEMOVE, mousemove));
  }

  function removeEvents(clientEmitter) {
    clientEmitter.removeAllListeners(EV_KEYDOWN);
    clientEmitter.removeAllListeners(EV_MOUSEMOVE);
  }

  function stop() {
    if (vmState.isRunning) {
      vmState.isRunning = false;
      clearInterval(timerInterval);
      rfb.stop();
      qemu.stop(vmState.port);
    }
    removeEvents(emitter);
    emitter.emit(EV_STOP);
  }

  function decrementTimer() {
    vmState.timer--;
    emitter.emit(EV_TIMER, { timer: vmState.timer });
    if (vmState.timer <= 0) {
      stop();
      emitter.emit(EV_STOP, {
        reason: RS_SESSION_EXPIRED,
      });
    }
  }

  function start(os) {
    const port = qemu.start(os);
    timerInterval = setInterval(decrementTimer, 1000);
    vmState = {
      ...vmState,
      isRunning: true,
      timer: VM_MAX_TIME,
      os,
      port,
    };
    rfb = rfbHandler(port + 5900);
    rfb.start();
    handleEvents(rfb.emitter, emitter);
    return vmState;
  }

  return {
    start,
    stop,
    emitter,
  };
};

const emitter = Object.assign({}, EventEmitter.prototype);

const vmController = () => vm({ emitter });

export default vmController;
