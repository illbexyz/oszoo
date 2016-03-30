import "babel-polyfill";
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
import vmManager from './virtual/vm-manager';

import {
  EV_START, EV_STOP, EV_SESSIONS_UPDATE,
  EV_TIMER, EV_FRAME, EV_RESIZE,
  EV_MOUSEMOVE, EV_KEYDOWN,
} from './constants/socket-events';

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

const vmSocket = io.of('/vm');
vmSocket.on('connection', (socket) => {
  let port;
  function handleEvents(vm, client) {
    vm.on(EV_STOP, reason => client.emit(EV_STOP, reason));
    vm.on(EV_TIMER, timer => client.emit(EV_TIMER, timer));
    vm.on(EV_FRAME, frame => client.emit(EV_FRAME, frame));
    vm.on(EV_RESIZE, rect => client.emit(EV_RESIZE, rect));
    client.on(EV_KEYDOWN, keydown => vm.emit(EV_KEYDOWN, keydown));
    client.on(EV_MOUSEMOVE, mousemove => vm.emit(EV_MOUSEMOVE, mousemove));
  }

  function removeEvents(client) {
    client.removeAllListeners(EV_KEYDOWN);
    client.removeAllListeners(EV_MOUSEMOVE);
  }

  function stopVm() {
    vmManager.stop(port);
    removeEvents(socket);
    vmSocket.emit(EV_SESSIONS_UPDATE, vmManager.getAvailableSessions());
  }

  socket.emit(EV_SESSIONS_UPDATE, vmManager.getAvailableSessions());

  socket.on(EV_START, os => {
    const vm = vmManager.start(os);
    port = vm.state.port;
    handleEvents(vm.emitter, socket);
    vmSocket.emit(EV_SESSIONS_UPDATE, vmManager.getAvailableSessions());
  });

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
