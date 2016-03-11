import { REQUEST_OSLIST, RECEIVED_OSLIST, SELECT_OS } from '../actions/os-list';

const osListReducer = (state = {
  isFetching: false,
  items: [],
  selectedOs: {},
}, action) => {
  switch (action.type) {
    case REQUEST_OSLIST:
      return {
        ...state,
        isFetching: true,
      };
    case RECEIVED_OSLIST:
      return {
        ...state,
        isFetching: false,
        items: action.items,
      };
    case SELECT_OS:
      return {
        ...state,
        selectedOs: action.os,
      };
    default:
      return state;
  }
};

export default osListReducer;
