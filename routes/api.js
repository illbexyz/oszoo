var express = require('express');
var db = require('../config/database');
var router = express.Router();

/* GET OS id. */
router.get('/os', function(req, res, next) {
	db.search('os', '*')
	.then(function(result){
		var os = [];
		for(value in result.body.results){
			for(key in result.body.results[value]){
				if(key == "value"){
					os.push(result.body.results[value][key]);
				}
			}
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

module.exports = router;
