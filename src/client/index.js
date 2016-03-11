import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';
import { Provider } from 'react-redux'

import createStore from './store/configureStore';

import App from './containers/app';

const store = createStore();
injectTapEventPlugin();

ReactDOM.render((
  <Provider store={store}>
    <App/>
  </Provider>
  ),
  document.getElementById('app'));
