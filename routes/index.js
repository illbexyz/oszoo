var express = require('express');
var router = express.Router();
var Qemu = require('../qemu.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: "OSZoo" });
});

module.exports = router;
