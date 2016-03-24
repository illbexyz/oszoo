import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router(); // eslint-disable-line

const configPath = path.join(__dirname, '../', 'oszoo-config.json');

function readConfig() {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, (err, data) => {
      if (err) reject(err);
      else resolve(JSON.parse(data));
    });
  });
}

// GET OS list
router.get('/os', (req, res, next) => { // eslint-disable-line
  readConfig()
    .then(response => response.os)
    .then(os => res.json(os))
    .catch(error => res.status(404).send(error));
});

// GET OS by id
router.get('/os/:id', (req, res, next) => { // eslint-disable-line
  readConfig()
    .then(response => response.oss[req.params.id])
    .then(os => os ? res.json(os) : res.status(404).send('Os not found'));
});

export default router;
