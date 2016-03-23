import {
  EV_FRAME, EV_TIMER, EV_START, EV_STOP,
  EV_KEYDOWN, EV_MOUSEMOVE, EV_RESIZE,
  EV_SESSIONS_UPDATE,
} from '../../constants/socket-events';

export const VM_START = 'VM_START';
export const VM_STOP = 'VM_STOP';
export const VM_RECEIVED_FRAME = 'VM_RECEIVED_FRAME';
export const VM_TIMER_UPDATE = 'VM_TIMER_UPDATE';
export const VM_KEYDOWN = 'VM_KEYDOWN';
export const VM_KEYUP = 'VM_KEYUP';
export const VM_MOUSE_MOVE = 'VM_MOUSE_MOVE';
export const VM_MOUSE_DOWN = 'VM_MOUSE_DOWN';
export const VM_MOUSE_UP = 'VM_MOUSE_UP';
export const VM_RESIZE = 'VM_RESIZE';
export const VM_SESSIONS_UPDATE = 'VM_SESSIONS_UPDATE';

let sessionTimerSubscription = undefined;
let frameSubscription = undefined;
let resizeSubscription = undefined;

function start() {
  return { type: VM_START };
}

function stop() {
  return { type: VM_STOP };
}

function frame(f) {
  return {
    type: VM_RECEIVED_FRAME,
    frame: f,
  };
}

function timer(t) {
  return {
    type: VM_TIMER_UPDATE,
    timer: t,
  };
}

function keydown(key) {
  return {
    type: VM_KEYDOWN,
    key,
  };
}

function keyup(key) {
  return {
    type: VM_KEYUP,
    key,
  };
}

function mousemove(position) {
  return {
    type: VM_MOUSE_MOVE,
    position,
  };
}

function mousedown() {
  return {
    type: VM_MOUSE_DOWN,
  };
}

function mouseup() {
  return {
    type: VM_MOUSE_UP,
  };
}

function resize(rect) {
  return {
    type: VM_RESIZE,
    size: {
      width: rect.width,
      height: rect.height,
    },
  };
}

function sessions(number) {
  return {
    type: VM_SESSIONS_UPDATE,
    sessions: number,
  };
}

export function sendKeydown(key) {
  return (dispatch, getState) => {
    const socket = getState().socketDetails.socket;
    socket.emit(EV_KEYDOWN, { key, keydown: 1 });
    dispatch(keydown(key));
  };
}

export function sendKeyup(key) {
  return (dispatch, getState) => {
    const socket = getState().socketDetails.socket;
    socket.emit(EV_KEYDOWN, { key, keydown: 0 });
    dispatch(keyup(key));
  };
}

function sendMouse(state) {
  const socket = state.socketDetails.socket;
  const { mouse } = state.vm;
  socket.emit(EV_MOUSEMOVE, mouse);
}

export function sendMouseMove(position) {
  return (dispatch, getState) => {
    dispatch(mousemove(position));
    sendMouse(getState());
  };
}

export function sendMouseUp() {
  return (dispatch, getState) => {
    dispatch(mouseup());
    sendMouse(getState());
  };
}

export function sendMouseDown() {
  return (dispatch, getState) => {
    dispatch(mousedown());
    sendMouse(getState());
  };
}

export function sessionsAvailableSubscribe() {
  return (dispatch, getState) => {
    const socket = getState().socketDetails.socket;
    socket.on(EV_SESSIONS_UPDATE, sessionsCount => {
      dispatch(sessions(sessionsCount));
    });
  };
}

export function sendStart(params) {
  return (dispatch, getState) => {
    const socket = getState().socketDetails.socket;
    socket.emit(EV_START, params);
    sessionTimerSubscription = socket.on(EV_TIMER, update => {
      dispatch(timer(update.timer));
    });
    frameSubscription = socket.on(EV_FRAME, f => {
      dispatch(frame(f));
    });
    resizeSubscription = socket.on(EV_RESIZE, rect => {
      dispatch(resize(rect));
    });
    dispatch(start());
  };
}

export function sendStop() {
  return (dispatch, getState) => {
    const socket = getState().socketDetails.socket;
    socket.emit(EV_STOP);
    socket.removeListener(EV_FRAME, frameSubscription);
    socket.removeListener(EV_TIMER, sessionTimerSubscription);
    socket.removeListener(EV_RESIZE, resizeSubscription);
    dispatch(stop());
  };
}
