jest.unmock('../os-list');
jest.unmock('../../actions/os-list');

const reducer = require('../os-list');
const REQUEST_OSLIST = require('../../actions/os-list').REQUEST_OSLIST;
const RECEIVED_OSLIST = require('../../actions/os-list').RECEIVED_OSLIST;

describe('osList reducer', () => {
  it('should be fetching when REQUEST_OSLIST', () => {
    const initialState = {
      isFetching: false,
      items: [],
    };
    const expectedState = {
      isFetching: true,
      items: [],
    };
    const nextState = reducer(initialState, { type: REQUEST_OSLIST });
    expect(nextState).toEqual(expectedState);
  });

  it('should have a list when RECEIVED_OSLIST', () => {
    const items = [{ title: 'Ubuntu' }, { title: 'Debian' }];
    const initialState = {
      isFetching: true,
      items: [],
    };
    const expectedState = {
      isFetching: false,
      items,
    };
    const nextState = reducer(initialState, { type: RECEIVED_OSLIST, osList: items });
    expect(nextState).toEqual(expectedState);
  });
});
