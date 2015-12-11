const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/oszoo');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('connected to mongo!');
});

module.exports = db;
