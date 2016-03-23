import express from 'express';
import path from 'path';
// import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
// import session from 'express-session';

import routes from './routes/index';
// import partials from './routes/partials';
import api from './routes/api';
// import admin from './routes/admin';
// import login from './routes/login';

import socketio from 'socket.io';
const io = socketio();

import User from './database/user';

import passport from 'passport';
import { Strategy } from 'passport-local';

// import adminController from './websockets/admin';
import vmController from './websockets/vm';

import { EV_START, EV_STOP, EV_SESSIONS_UPDATE } from './constants/socket-events';


// Passport Configuration
// passport.use(new Strategy((username, password, cb) => {
//   User.findByUsername(username, (user) => {
//     user.validPassword(password) ?
//       cb(null, user)
//       :
//       cb(null, false, { message: 'Incorrect password' });
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

// Constants

// Number of max sessions available
const MAX_SESSIONS = 20;

const app = express();
app.io = io;

// Middlewares and express config

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
// }));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(cookieParser());
// app.use(require('coffee-middleware'), {src: "//{__dirname}/public"})
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',
        express.static(path.join(__dirname, 'bower_components')));

app.use('/api', api);
// app.use('/login', login);
// app.use('/admin', admin);
// app.use('/partials', partials);
app.use('*', routes);

// Body

// List containing infos for each session
// let activeSessions = [];
// Current sessions available
let sessions = [];
let availableSessions = MAX_SESSIONS;

// const adminSocket = io.of('/admin');
// adminSocket.on('connection', (socket) => {
//   const adminContr = adminController({ socket, state });
// });

const vmSocket = io.of('/vm');
vmSocket.on('connection', (socket) => {
  const vmcontr = vmController({ socket });
  let vmRunning = false;

  vmSocket.emit(EV_SESSIONS_UPDATE, availableSessions);

  function stopVm() {
    if (vmRunning) {
      vmcontr.stop();
      vmSocket.emit(EV_SESSIONS_UPDATE, ++availableSessions);
    }
  }

  socket.on(EV_START, (config, callback) => {
    if (availableSessions) {
      vmRunning = true;
      vmcontr.start(config, callback);
      vmSocket.emit(EV_SESSIONS_UPDATE, --availableSessions);
    }
  });

  socket.on('disconnect', () => {
    stopVm();
  });

  socket.on(EV_STOP, () => {
    stopVm();
  });
});

process.on('uncaughtException', (err) => {
  console.error(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => { //eslint-disable-line
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

module.exports = app;
