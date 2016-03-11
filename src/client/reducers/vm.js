import {
  VM_START, VM_STOP,
  VM_RECEIVED_FRAME,
  VM_TIMER_UPDATE,
  VM_KEYDOWN,
  VM_KEYUP,
  VM_MOUSE_MOVE,
  VM_MOUSE_DOWN,
  VM_MOUSE_UP,
} from '../actions/vm';

const vmReducer = (state = {
  waitingFirstFrame: false,
  isRunning: false,
  timer: 0,
  os: {},
  lastFrame: {},
  mouse: {
    x: 0,
    y: 0,
    isButton1Down: false,
  },
  keyboard: {
    isKeyDown: false,
  },
}, action) => {
  switch (action.type) {
    case VM_START:
      return {
        ...state,
        os: action.os,
        waitingFirstFrame: true,
      };
    case VM_STOP:
      return {
        ...state,
        isRunning: false,
        os: {},
        timer: 0,
      };
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
          x: action.position.x,
          y: action.position.y,
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
    default:
      return state;
  }
};

export default vmReducer;
