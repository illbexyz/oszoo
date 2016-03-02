require('./database');
const mongoose = require('mongoose');

const osSchema = mongoose.Schema({
  title: String,
  consoleTitle: String,
  memory: Number,
  arch: String,
  diskImage: String,
  cdrom: String,
  description: String,
});

const Os = mongoose.model('Os', osSchema);

module.exports = Os;
