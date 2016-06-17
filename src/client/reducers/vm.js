import {
  VM_START, VM_STOP,
  VM_RECEIVED_FRAME,
  VM_TIMER_UPDATE,
  VM_KEYDOWN,
  VM_KEYUP,
  VM_MOUSE_MOVE,
  VM_MOUSE_DOWN,
  VM_MOUSE_UP,
  VM_RESIZE,
  VM_SESSIONS_UPDATE,
} from '../actions/vm';

import { RS_SESSION_EXPIRED } from '../../constants/socket-events';

function mousePosition(current, move, minLimit, maxLimit) {
  let res = current + move;
  if (res < minLimit) res = minLimit;
  else if (res > maxLimit) res = maxLimit;
  return res;
}

function stop(state, action) {
  let newState = {
    ...state,
    isRunning: false,
    waitingFirstFrame: false,
    lastFrame: {},
    os: {},
    timer: 0,
  };
  if (action.reason === RS_SESSION_EXPIRED) {
    newState = {
      ...newState,
      sessionExpired: true,
    };
  }
  return newState;
}

const vmReducer = (state = {
  waitingFirstFrame: false,
  isRunning: false,
  sessionExpired: false,
  timer: 0,
  os: {},
  lastFrame: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    image: '',
  },
  mouse: {
    x: 0,
    y: 0,
    isButton1Down: false,
  },
  keyboard: {
    isKeyDown: false,
  },
  size: {
    width: 0,
    height: 0,
  },
  sessionsAvailable: 0,
}, action) => {
  switch (action.type) {
    case VM_START:
      return {
        ...state,
        os: action.os,
        waitingFirstFrame: true,
      };
    case VM_STOP:
      return stop(state, action);
    case VM_RECEIVED_FRAME:
      return {
        ...state,
        waitingFirstFrame: false,
        isRunning: true,
        lastFrame: action.frame,
      };
    case VM_TIMER_UPDATE:
      return {
        ...state,
        timer: action.timer,
      };
    case VM_RESIZE:
      return {
        ...state,
        size: action.size,
        mouse: {
          ...state.mouse,
          x: action.size.width / 2,
          y: action.size.height / 2,
        }
      };
    case VM_KEYDOWN:
      return {
        ...state,
        keyboard: {
          ...state.keyboard,
          isKeyDown: true,
        },
      };
    case VM_KEYUP:
      return {
        ...state,
        keyboard: {
          ...state.keyboard,
          isKeyDown: true,
        },
      };
    case VM_MOUSE_MOVE:
      return {
        ...state,
        mouse: {
          ...state.mouse,
          x: mousePosition(state.mouse.x, action.position.x, 0, state.size.width),
          y: mousePosition(state.mouse.y, action.position.y, 0, state.size.height),
        },
      };
    case VM_MOUSE_DOWN:
      return {
        ...state,
        mouse: {
          ...state.mouse,
          isButton1Down: true,
        },
      };
    case VM_MOUSE_UP:
      return {
        ...state,
        mouse: {
          ...state.mouse,
          isButton1Down: false,
        },
      };
    case VM_SESSIONS_UPDATE:
      return {
        ...state,
        sessionsAvailable: action.sessions,
      };
    default:
      return state;
  }
};

export default vmReducer;
