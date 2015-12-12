'use strict';

//----------------------------------------------------------------------------//
//---------------------------- Os Service ------------------------------------//
//----------------------------------------------------------------------------//

module.exports = function($http) {
  const url = '/api/os';

  let getList = function(){
    const request = $http.get(url);
    return request.then(successHandler, failureHandler);
  };

  let post = function(os) {
    const request = $http.post(url, os);
    return request.then(successHandler, failureHandler);
  };

  let put = function(os) {
    const request = $http.put(url, os);
    return request.then(successHandler, failureHandler);
  };

  let deleteOs = function(os) {
    const deleteUrl = `${url}/${os._id}`;
    const request = $http.delete(deleteUrl);
    return request.then(successHandler, failureHandler);
  };

  let successHandler = function(response) {
    return response.data;
  };

  let failureHandler = function(error) {
    console.error(`error getting the os list ${error}`);
  };

  return {
    getList: getList,
    post: post,
    put: put,
    delete: deleteOs
  };
};