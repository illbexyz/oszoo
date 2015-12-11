'use strict'

#------------------------------------------------------------------------------#
#----------------------------- Os Service -------------------------------------#
#------------------------------------------------------------------------------#

module.exports = ($http) ->
  url = '/api/os'

  getList = ->
    request = $http.get(url)
    request.then successHandler, failureHandler

  post = (os) ->
    request = $http.post(url, os)
    request.then successHandler, failureHandler

  put = (os) ->
    request = $http.put(url, os)
    request.then successHandler, failureHandler

  deletea = (os) ->
    deleteUrl = url + '/' + os._id
    request = $http.delete(deleteUrl)
    request.then successHandler, failureHandler

  successHandler = (response) ->
    return response.data

  failureHandler = (response) ->
    console.error 'error getting the os list'
    return

  return {
    getList: getList
    post: post
    put: put
    delete: deletea
  }