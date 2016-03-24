import express from 'express';
import path from 'path';
// import favicon from 'serve-favicon';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
// import session from 'express-session';

import database from './database/database';
import routes from './routes/index';
import api from './routes/api';

import socketio from 'socket.io';
const io = socketio();

// import adminController from './websockets/admin';
import vmController from './websockets/vm';

import { EV_START, EV_STOP, EV_SESSIONS_UPDATE } from './constants/socket-events';

// Number of max sessions available
const MAX_SESSIONS = 20;

const app = express();
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Uncomment if using session

// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
// }));
// app.use(passport.initialize());
// app.use(passport.session());

app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',
        express.static(path.join(__dirname, 'bower_components')));

app.use('/api', api);
app.use('*', routes);

// let sessions = [];
let availableSessions = MAX_SESSIONS;

const vmSocket = io.of('/vm');
vmSocket.on('connection', (socket) => {
  const vmcontr = vmController({ socket });

  let vmRunning = false;

  vmSocket.emit(EV_SESSIONS_UPDATE, availableSessions);

  socket.on(EV_START, (config, callback) => {
    if (!vmRunning) {
      vmRunning = true;
      vmcontr.emitter.once('stop', () => {
        vmSocket.emit(EV_SESSIONS_UPDATE, ++availableSessions);
      });
      if (availableSessions) {
        vmcontr.start(config, callback)
          .then(() => vmSocket.emit(EV_SESSIONS_UPDATE, --availableSessions));
      }
    }
  });

  function stopVm() {
    if (vmRunning) {
      vmRunning = false;
      vmcontr.stop();
    }
  }

  socket.on('disconnect', stopVm);

  socket.on(EV_STOP, stopVm);
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

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => { //eslint-disable-line
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
} else {
  app.use((err, req, res, next) => { //eslint-disable-line
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {},
    });
  });
}

export default app;
