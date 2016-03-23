import test from 'tape';

import {
  REQUEST_OSLIST,
  RECEIVED_OSLIST,
  SELECT_OS,
} from '../../actions/os-list';
import reducer from '../../reducers/os-list';

test('--- OSList Reducer ---', (unit) => {
  unit.test('should be fetching when REQUEST_OSLIST', (t) => {
    const initialState = {
      isFetching: false,
      items: [],
    };
    const expectedState = {
      isFetching: true,
      items: [],
    };
    const nextState = reducer(initialState, { type: REQUEST_OSLIST });
    t.deepEqual(nextState, expectedState);
    t.end();
  });

  unit.test('should have a list when RECEIVED_OSLIST', (t) => {
    const items = [{ title: 'Ubuntu' }, { title: 'Debian' }];
    const initialState = {
      isFetching: true,
      items: [],
    };
    const expectedState = {
      isFetching: false,
      items,
    };
    const nextState = reducer(initialState, {
      type: RECEIVED_OSLIST,
      items,
    });
    t.deepEqual(nextState, expectedState);
    t.end();
  });

  unit.test('should select an os when SELECT_OS', (t) => {
    const os = {
      title: 'Debian',
      memory: 256,
    };
    const initialState = {
      selectedOs: {},
    };
    const expectedState = {
      selectedOs: os,
    };
    const nextState = reducer(initialState, {
      type: SELECT_OS,
      os,
    });
    t.deepEqual(nextState, expectedState);
    t.end();
  });
  unit.end();
});
