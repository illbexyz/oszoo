const db = require('./database');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  username: String,
  password: String,
});

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

userSchema.statics.findByUsername = function(username, success) {
  User.find({username: username}, (err, user) => {
    if(err) return console.error(err);
    success(user[0]);
  });
}

const User = mongoose.model('User', userSchema);

module.exports = User;