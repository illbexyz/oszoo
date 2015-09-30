var express = require('express');
var router = express.Router();

/* GET computer page. */
router.get('/', function(req, res, next) {
  res.render('computer', { title: "OSZoo" });
});

module.exports = router;
