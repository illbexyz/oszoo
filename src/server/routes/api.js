import express from 'express';
import Os from '../database/os';

const router = express.Router();

// GET OS list
router.get('/os', (req, res) => {
  Os.find()
    .then(os => res.json(os))
    .catch(err => res.status(400).send(`Error retriving the oslist: ${err}`));
});

// GET OS by id
router.get('/os/:id', (req, res) => {
  Os.findById(req.params.id)
    .then(os => res.json(os))
    .catch(err => res.status(400).send(`Error retriving an os: ${err}`));
});

router.post('/os', (req, res) => {
  const os = new Os(req.body.os);
  os.save()
    .then((savedOs) => res.json(savedOs))
    .catch((err) => res.status(400).send(`Error creating an os ${err}`));
});

router.put('/os/:id', (req, res) => {
  Os.findByIdAndUpdate(req.params.id, req.body.os)
    .then(os => res.json(os))
    .catch(err => res.status(400).send(`Error modifying an os ${err}`));
});

router.delete('/os/:id', (req, res) => {
  Os.findByIdAndRemove(req.params.id)
    .then(result => res.json(result.body))
    .catch(err => res.status(400).send(`Error deleting an os ${err}`));
});

export default router;
