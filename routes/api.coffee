express = require('express')
db = require('../database/database')
router = express.Router()

### GET OS id. ###

router.get '/os', (req, res, next) ->
  db.list('os').then (os) ->
    res.json os
    return
  return

### GET OS id. ###

router.get '/os/:id', (req, res, next) ->
  db.get('os', req.params.id).then((result) ->
    res.json result.body
    return
  ).fail (error) ->
    console.log 'Error retriving the os: ' + error
    return
  return
router.post '/os', (req, res) ->
  db.post('os', req.body).then((result) ->
    res.json result.body
    return
  ).fail (error) ->
    console.log 'Error creating a new os'
    return
  return
router.put '/os', (req, res) ->
  db.put('os', req.body.id, req.body).then((result) ->
    res.json result.body
    return
  ).fail (error) ->
    console.log 'Error modifying an os'
    return
  return
router.delete '/os/:id', (req, res) ->
  console.log req.params.id
  db.delete('os', req.params.id).then((result) ->
    res.json result.body
    return
  ).fail (error) ->
    console.log 'Error deleting an os'
    return
  return
module.exports = router
