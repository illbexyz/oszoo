db = require('./database')
bcrypt = require('bcrypt')
collection = 'users'
usermodel = {}

class User
  constructor: (username, password) ->
    @username = username
    @password = password

  validPassword: (password) ->
    bcrypt.compareSync password, @password

usermodel.findById = (id, success, failure) ->
  db.get(collection, id).then((result) ->
    user = new User result.username, result.password
    success(user)
  ).fail (error) ->
    failure(error)

usermodel.findByUsername = (username, success, failure) ->
  db.search(collection, "username:#{username}").then((result) ->
    user = new User result[0].username, result[0].password
    success(user)
  ).fail (error) ->
    failure(error)

module.exports = usermodel
