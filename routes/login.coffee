express = require('express')
passport = require('passport')
router = express.Router()

# GET login page. #
router.get '/', (req, res, next) ->
  res.render 'login', title: 'Login'

# Authenticate
router.post '/', passport.authenticate('local', { successRedirect: '/admin', failureRedirect: '/login' })

module.exports = router
