import { combineReducers } from 'redux';

import osListReducer from './os-list';
import socketReducer from './socket';
import vmReducer from './vm';

const rootReducer = combineReducers({
  osList: osListReducer,
  socketDetails: socketReducer,
  vm: vmReducer,
});

export default rootReducer;
