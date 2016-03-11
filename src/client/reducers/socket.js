import {
  CONNECT_SOCKET,
  CONNECTED_SOCKET, DISCONNECTED_SOCKET,
} from '../actions/socket';

const socketReducer = (state = {
  isConnecting: false,
  socket: undefined,
}, action) => {
  switch (action.type) {
    case CONNECT_SOCKET:
      return {
        ...state,
        isConnecting: true,
      };
    case CONNECTED_SOCKET:
      return {
        ...state,
        isConnecting: false,
        socket: action.socket,
      };
    case DISCONNECTED_SOCKET:
      return {
        ...state,
        socket: undefined,
      };
    default:
      return state;
  }
};

export default socketReducer;
