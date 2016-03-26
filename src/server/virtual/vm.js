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

const qemu = qemuFactory({ x8664Executable, VM_MAX_SESSIONS });

const vm = (emitter) => {
  let timerInterval = undefined;
  let rfb = undefined;

  /*
    isRunning: false,
    port: undefined,
    timer: VM_MAX_TIME,
    os: {},
  */
  let state = {};

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
    if (state.isRunning) {
      state.isRunning = false;
      clearInterval(timerInterval);
      rfb.stop();
      qemu.stop(state.port);
    }
    removeEvents(emitter);
    emitter.emit(EV_STOP);
  }

  function decrementTimer() {
    state.timer--;
    emitter.emit(EV_TIMER, { timer: state.timer });
    if (state.timer <= 0) {
      stop();
      emitter.emit(EV_STOP, {
        reason: RS_SESSION_EXPIRED,
      });
    }
  }

  function start(os) {
    const port = qemu.start(os);
    timerInterval = setInterval(decrementTimer, 1000);
    state = {
      ...state,
      isRunning: true,
      timer: VM_MAX_TIME,
      os,
      port,
    };
    rfb = rfbHandler(port + 5900);
    rfb.start();
    handleEvents(rfb.emitter, emitter);
    return state;
  }

  return {
    start,
    stop,
    emitter,
  };
};

const vmController = () => vm(Object.assign({}, EventEmitter.prototype));

export default vmController;
