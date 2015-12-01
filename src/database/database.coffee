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
    values = []
    for result in result.body.results
      result.value.id = result.path.key
      values.push result.value
    deferred.resolve values
  ).fail (error) ->
    deferred.reject error
  deferred.promise

db.search = (collection, query) ->
  deferred = Q.defer()
  orchestrate.search(collection, query).then((result) ->
    values = []
    for result in result.body.results
      result.value.id = result.path.key
      values.push result.value
    deferred.resolve values
  ).fail (err) ->
    q.reject err
  deferred.promise

db.get = (collection, key) ->
  deferred = Q.defer()
  orchestrate.get(collection, key).then((result) ->
    q.resolve result
  ).fail (err) ->
    q.reject err
  deferred.promise

db.post = (collection, object) ->
  deferred = Q.defer()
  orchestrate.post(collection, object).then((result) ->
    q.resolve result
  ).fail (err) ->
    q.reject err
  deferred.promise

db.put = (collection, key, object) ->
  deferred = Q.defer()
  orchestrate.put(collection, key, object).then((result) ->
    q.resolve result
  ).fail (err) ->
    q.reject err
  deferred.promise

db.delete = (collection, key) ->
  deferred = Q.defer()
  orchestrate.remove(collection, key, true).then((result) ->
    q.resolve result
  ).fail (err) ->
    q.reject err
  deferred.promise

module.exports = db
