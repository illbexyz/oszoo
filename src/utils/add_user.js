const bcrypt = require('bcrypt');
const User = require('../database/user');

bcrypt.genSalt(10, function(err, salt) {
  bcrypt.hash(process.argv[3], salt, function(err, hash) {
    const newUser = new User({username: process.argv[2], password: hash});
    newUser.save((err, user) => {
      if(err) return console.error(err);
      console.log(`user ${user.username} created.`);
      process.exit(0);
    });
  });
});