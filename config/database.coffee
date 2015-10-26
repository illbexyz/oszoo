oio = require('orchestrate')
oio.ApiEndPoint = 'api.aws-eu-west-1.orchestrate.io'
orchestrate = oio('11eff33e-251f-46ae-81c1-fa0b0472789f')
db = {}
Q = require('q')
orchestrate.ping().fail (err) ->
  console.log 'Database unreachable'
  return

db.list = (collection) ->
  deferred = Q.defer()
  orchestrate.search('os', '*').then((result) ->
    os = []
    for key of result.body.results
      `key = key`
      result.body.results[key].value.id = result.body.results[key].path.key
      os.push result.body.results[key].value
    deferred.resolve os
    return
  ).fail (error) ->
    console.log 'Error retriving the os list'
    deferrend.reject error
    return
  deferred.promise

db.post = (collection, object) ->
  deferred = Q.defer()
  orchestrate.post(collection, object).then((result) ->
    q.resolve result
    return
  ).fail (err) ->
    q.reject err
    return
  deferred.promise

db.put = (collection, key, object) ->
  deferred = Q.defer()
  orchestrate.put(collection, key, object).then((result) ->
    q.resolve result
    return
  ).fail (err) ->
    q.reject err
    return
  deferred.promise

db.delete = (collection, key) ->
  deferred = Q.defer()
  console.log key
  orchestrate.remove(collection, key, true).then((result) ->
    q.resolve result
    return
  ).fail (err) ->
    q.reject err
    return
  deferred.promise

module.exports = db
