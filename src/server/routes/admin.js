const express = require('express');
const router = express.Router();

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

router.get('/', authenticated, (req, res, next) => {
  res.render('admin', { title: 'Admin' });
});

module.exports = router;
