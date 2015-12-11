const express = require('express');
const passport = require('passport');
const csrf = require('csurf');
const router = express.Router();

router.use(csrf());

// GET login page
router.get('/', function(req, res, next) {
  res.render('login', {title: 'Login', csrfToken: req.csrfToken()});
});

// Authenticate
router.post('/', passport.authenticate('local',
    { successRedirect: '/admin', failureRedirect: '/login' }));

module.exports = router;
