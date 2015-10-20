var express = require('express');
var db = require('../config/database');
var router = express.Router();

/* GET OS id. */
router.get('/os', function(req, res, next) {
	db.search('os', '*')
	.then(function(result){
		var os = [];
		for(key in result.body.results){
			result.body.results[key].value.id = result.body.results[key].path.key;
			os.push(result.body.results[key].value);
		}
		res.json(os);
	})
	.fail(function(error){
		console.log("Error retriving the os list");
		console.log(error);
	});
});

/* GET OS id. */
router.get('/os/:id', function(req, res, next) {
	db.get('os', req.params.id)
	.then(function(result){
		res.json(result.body);
	})
	.fail(function(error){
		console.log("Error retriving the os: " + error)
	});
});

router.post('/os', function(req, res){
	console.log(req.body);
});

module.exports = router;
