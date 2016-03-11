import fetch from 'isomorphic-fetch';

export const REQUEST_OSLIST = 'REQUEST_OSLIST';
export const RECEIVED_OSLIST = 'RECEIVED_OSLIST';
export const SELECT_OS = 'SELECT_OS';

export function requestList() {
  return { type: REQUEST_OSLIST };
}

export function receiveList(json) {
  return {
    type: RECEIVED_OSLIST,
    items: json,
  };
}

export function selectOs(os) {
  return {
    type: SELECT_OS,
    os,
  };
}

export function fetchList() {
  return dispatch => {
    dispatch(requestList());
    return fetch('http://localhost/api/os')
      .then(response => response.json())
      .then(json => dispatch(receiveList(json)));
  };
}
