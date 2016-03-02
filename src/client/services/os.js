module.exports = function osService($http) {
  const url = '/api/os';

  const successHandler = (response) => response.data;

  const failureHandler = (error) => {
    console.error(`error getting the os list ${error}`);
  };

  const getList = () => {
    const request = $http.get(url);
    return request.then(successHandler, failureHandler);
  };

  const post = (os) => {
    const request = $http.post(url, os);
    return request.then(successHandler, failureHandler);
  };

  const put = (os) => {
    const request = $http.put(url, os);
    return request.then(successHandler, failureHandler);
  };

  const deleteOs = (os) => {
    const deleteUrl = `${url}/${os._id}`;
    const request = $http.delete(deleteUrl);
    return request.then(successHandler, failureHandler);
  };

  return {
    getList,
    post,
    put,
    delete: deleteOs,
  };
};
