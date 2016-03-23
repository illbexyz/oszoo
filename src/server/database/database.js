// import passport from 'passport';
// import { Strategy } from 'passport-local';
// import User from './database/user';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost/oszoo');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('connected to mongo!');
});

// Passport Configuration
// passport.use(new Strategy((username, password, cb) => {
//   User.findByUsername(username, (user) => {
//     if (user.validPassword(password)) {
//       return cb(null, user);
//     } else {
//       return cb(null, false, { message: 'Incorrect password' });
//     }
//   }, (error) => cb(null, false, { message: `Incorrect username: ${error}` }));
// }));

// passport.serializeUser((user, cb) => {
//   cb(null, user.username);
// });

// passport.deserializeUser((name, cb) => {
//   User.findByUsername(name, (user) => {
//     cb(null, user);
//   });
// });

export default db;
