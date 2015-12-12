const express = require('express');
const Os = require('../database/os');
const router = express.Router();

// GET OS list
router.get('/os', function(req, res, next){
  Os.find().then((os) => {
    res.json(os);
  }, (error) => {
    console.error(`Error retriving an os: ${error}`);
  });
});

// GET OS by id
router.get('/os/:id', function(req, res, next) {
  Os.findById(req.params.id).then((os) => {
    res.json(os);
  }, (error) => {
    console.error(`Error retriving an os: ${error}`);
  });
});

router.post('/os', function(req, res){
  const os = new Os({
    title: req.body.title,
    consoleTitle: req.body.consoleTitle,
    memory: req.body.memory,
    arch: req.body.arch,
    diskImage: req.body.diskImage,
    cdrom: req.body.cdrom,
    description: req.body.description
  });
  os.save(function(err, savedOs) {
    if(err) return console.error(`Error creating a new os ${err}`);
    res.json(savedOs);
  });
});

router.put('/os', function(req, res) {
  Os.findById(req.body._id).then((os) => {
    os.title = req.body.title;
    os.consoleTitle = req.body.consoleTitle;
    os.memory = req.body.memory;
    os.arch = req.body.arch;
    os.diskImage = req.body.diskImage;
    os.cdrom = req.body.cdrom;
    os.description = req.body.description;
    os.save(function(err, savedOs) {
      if(err) return console.error(`Error modifying an os ${err}`);
      res.json(savedOs);
    });
  }, (error) => {
    console.error(`Error retriving an os: ${error}`);
  });
});

router.delete('/os/:id', function(req, res) {
  console.log(req.params);
  Os.findByIdAndRemove(req.params.id).then((result) => {
    res.json(result.body);
  }, (error) => {
    console.error(`Error deleting an os: ${error}`);
  });
});

module.exports = router;
