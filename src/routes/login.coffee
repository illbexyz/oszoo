express = require('express')
passport = require('passport')
csrf = require('csurf')
router = express.Router()

router.use(csrf())

# GET login page. #
router.get '/', (req, res, next) ->
  res.render 'login', {title: 'Login', csrfToken: req.csrfToken()}

# Authenticate
router.post '/', passport.authenticate('local',
    { successRedirect: '/admin', failureRedirect: '/login' })

module.exports = router
