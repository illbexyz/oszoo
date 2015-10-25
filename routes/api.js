var express = require('express');
var db = require('../config/database');
var router = express.Router();

/* GET OS id. */
router.get('/os', function(req, res, next) {
	db.list('os').then(function(os){
		res.json(os);
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
	db.post('os', req.body)
	.then(function(result) {
		res.json(result.body);
	})
	.fail(function(error) {
		console.log("Error creating a new os");
	});
});

router.put('/os', function(req, res) {
	db.put('os', req.body.id, req.body)
	.then(function(result) {
		res.json(result.body);
	})
	.fail(function(error) {
		console.log("Error modifying an os");
	});
});

router.delete('/os/:id', function(req, res) {
	console.log(req.params.id);
	db.delete('os', req.params.id)
	.then(function(result) {
		res.json(result.body);
	})
	.fail(function(error) {
		console.log("Error deleting an os");
	});
});

module.exports = router;
