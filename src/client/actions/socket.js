import { socketUrl } from '../../constants/misc';

import socketIO from 'socket.io-client';

import { sessionsAvailableSubscribe } from './vm';

export const CONNECT_SOCKET = 'CONNECT_SOCKET';
export const CONNECTED_SOCKET = 'CONNECTED_SOCKET';
export const DISCONNECTED_SOCKET = 'DISCONNECTED_SOCKET';

function connect() {
  return {
    type: CONNECT_SOCKET,
  };
}

function connected(socket) {
  return {
    type: CONNECTED_SOCKET,
    socket,
  };
}

function disconnected() {
  return {
    type: DISCONNECTED_SOCKET,
  };
}

export function connectSocket() {
  return dispatch => {
    dispatch(connect());
    const socket = socketIO(socketUrl);
    socket.on('connect', () => {
      dispatch(connected(socket));
      dispatch(sessionsAvailableSubscribe());
    });
    socket.on('disconnect', () => {
      dispatch(disconnected());
    });
  };
}
