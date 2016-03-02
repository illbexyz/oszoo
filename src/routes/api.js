const express = require('express');
const Os = require('../database/os');
const router = express.Router();

// GET OS list
router.get('/os', (req, res, next) => {
  Os.find().then((os) => {
    res.json(os);
  }, (error) => {
    console.error(`Error retriving an os: ${error}`);
  });
});

// GET OS by id
router.get('/os/:id', (req, res, next) => {
  Os.findById(req.params.id).then((os) => {
    res.json(os);
  }, (error) => {
    console.error(`Error retriving an os: ${error}`);
  });
});

router.post('/os', (req, res) => {
  const os = new Os({
    title: req.body.title,
    consoleTitle: req.body.consoleTitle,
    memory: req.body.memory,
    arch: req.body.arch,
    diskImage: req.body.diskImage,
    cdrom: req.body.cdrom,
    description: req.body.description,
  });
  os.save()
    .then((savedOs) => res.json(savedOs))
    .catch((err) => console.error(`Error modifying an os ${err}`));
});

router.put('/os', (req, res) => {
  Os.findById(req.body._id)
    .then((os) => {
      os.title = req.body.title;
      os.consoleTitle = req.body.consoleTitle;
      os.memory = req.body.memory;
      os.arch = req.body.arch;
      os.diskImage = req.body.diskImage;
      os.cdrom = req.body.cdrom;
      os.description = req.body.description;
      os.save()
        .then((savedOs) => res.json(savedOs))
        .catch((err) => console.error(`Error modifying an os ${err}`));
    })
    .catch((error) => {
      console.error(`Error retriving an os: ${error}`);
    });
});

router.delete('/os/:id', (req, res) => {
  Os.findByIdAndRemove(req.params.id).then((result) => {
    res.json(result.body);
  }, (error) => {
    console.error(`Error deleting an os: ${error}`);
  });
});

module.exports = router;
