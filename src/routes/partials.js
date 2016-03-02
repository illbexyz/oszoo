const express = require('express');
const csrf = require('csurf');
const router = express.Router();

router.use(csrf());

// GET home page
router.get('/:name', (req, res) => {
  const name = req.params.name;
  res.render(`partials/${name}`, { csrfToken: req.csrfToken() });
});

module.exports = router;
