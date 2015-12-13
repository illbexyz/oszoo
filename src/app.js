const express = require('express');
const path = require('path');
//const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

const routes = require('./routes/index');
const partials = require('./routes/partials');
const api = require('./routes/api');
const admin = require('./routes/admin');
const login = require('./routes/login');

const io = require('socket.io')();

const User = require('./database/user');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const AdminController = require('./websockets/admin');
const VmController = require('./websockets/vm');

const WatchJS = require('watchjs');
const watch = WatchJS.watch;
//const unwatch = WatchJS.unwatch;
//const callWatchers = WatchJS.callWatchers;

//------------------------------------------------------------------------------//
//------------------------- Passport configuration -----------------------------//
//------------------------------------------------------------------------------//

passport.use(new LocalStrategy((username, password, cb) => {
  User.findByUsername(username, (user) => {
    if(user.validPassword(password)){
      return cb(null, user);
    } else {
      return cb(null, false, {message: 'Incorrect password'});
    }
  }, (error) => {
    return cb(null, false, {message: `Incorrect username: ${error}`});
  });
}));

passport.serializeUser((user, cb) => {
  cb(null, user.username);
});

passport.deserializeUser((name, cb) => {
  User.findByUsername(name, (user) => {
    cb(null, user);
  });
});

//------------------------------------------------------------------------------//
//-------------------------------- Constants -----------------------------------//
//------------------------------------------------------------------------------//

// Number of max sessions available
const MAX_SESSIONS = 20;

let app = express();
app.io = io;

//------------------------------------------------------------------------------//
//--------------------- Middlewares & Express configs --------------------------//
//------------------------------------------------------------------------------//

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
//app.use(require('coffee-middleware'), {src: "//{__dirname}/public"})
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',
        express.static(path.join(__dirname, 'bower_components')));
app.use('/api', api);
app.use('/login', login);
app.use('/admin', admin);
app.use('/partials', partials);
app.use('*', routes);

//------------------------------------------------------------------------------//
//------------------------------------ Body ------------------------------------//
//------------------------------------------------------------------------------//

// List containing infos for each session
let activeSessions = []; //eslint-disable-line
// Current sessions available
let availableSessions = new Number(MAX_SESSIONS); //eslint-disable-line

let state = {
  activeSessions: [],
  availableSessions: MAX_SESSIONS
};

let adminSocket = io.of('/admin');
adminSocket.on('connection', (socket) => {
  let adminController = AdminController({socket: socket, state: state});
});

let vmSocket = io.of('/vm');
vmSocket.on('connection', (socket) => {
  let vmController = VmController({socket: socket, state: state});
  socket.on('start', vmController.start.bind(vmController));
  socket.on('disconnect', vmController.stop.bind(vmController));
  socket.on('stop', vmController.stop.bind(vmController));
});

watch(state, 'availableSessions', () => {
  adminSocket.emit('available-sessions', {sessions: state.availableSessions});
  adminSocket.emit('culo');
  vmSocket.emit('available-sessions', {sessions: state.availableSessions});
});

watch(state, 'activeSessions', () => {
  adminSocket.emit('clients', {clients: state.activeSessions});
});

process.on('uncaughtException', (err) => {
  console.error(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if(app.get('env') == 'development') {
  app.use((err, req, res, next) => { //eslint-disable-line
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => { //eslint-disable-line
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;