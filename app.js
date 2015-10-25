var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var qemu = require('./qemu.js');
var RfbHandler = require('./rfb-handler.js');

var routes = require('./routes/index');
var partials = require('./routes/partials');
var api = require('./routes/api');
var admin = require('./routes/admin');

var app = express();
var io = require('socket.io')();

// Number of max sessions available
var MAX_SESSIONS = 20;
// Current sessions available
var availableSessions = MAX_SESSIONS;

app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));

app.use('/api', api);
app.use('/admin', admin);
app.use('/partials', partials);
app.use('*', routes);

var TIMER = 600;

var clients = [];

var admin = io.of('/admin');
admin.on('connection', function(socket){
  socket.emit('available-sessions', {sessions: availableSessions});
  socket.emit('clients', clients);
});

var vm = io.of('/vm');
vm.on('connection', function (socket) {
  var connectionInfo = {
    ip: "",
    screenPort: 0,  // Port used in the current socket
    timer: 0
  };
  connectionInfo.ip = socket.request.connection.remoteAddress;
  console.log(connectionInfo.ip);
  // Communication handler
  var rfbHandler;
  // Sends to the client the number of available sessions
  socket.emit('available-sessions', {sessions: availableSessions});
  var vmRunning = false;
  connectionInfo.timer = TIMER;
  var timerCallback;

  // Client starts a new vm
  socket.on('start', function(config){
    clients.push(connectionInfo);
    admin.emit('new-client', connectionInfo);
    if(availableSessions) {
      console.log(vmRunning);
      if(vmRunning){
        restartQemu(connectionInfo.screenPort);
      }
      if(connectionInfo.timer < TIMER){
        connectionInfo.timer = 600;
      }
      qemu.start(config, function(err, port, password){
        timerCallback = setInterval(function() {
          connectionInfo.timer--;
          socket.emit('session-timer', {timer: connectionInfo.timer});
          if(connectionInfo.timer == 0){
            stopQemu(connectionInfo.screenPort);
            socket.emit('session-expired');
          }
        }, 1000);
        connectionInfo.screenPort = port;
        // In RFB protocol the port is: screenPort + 5900
        var rfbPort = port + 5900;
        console.log('qemu started on port ' + rfbPort);
        availableSessions--;
        vm.emit('available-sessions', {sessions: availableSessions});
        admin.emit('available-sessions', {sessions: availableSessions});
        vmRunning = true;
        console.log(vmRunning);
        rfbHandler = new RfbHandler(socket, rfbPort, password);
        rfbHandler.start();
      });
    }
  });

  // When the client accidentally disconnects
  socket.on('disconnect', function() {
    if(connectionInfo.screenPort){
      console.log('Stopping qemu (disconnect) ' + connectionInfo.screenPort);
      stopQemu(connectionInfo.screenPort);
    }
  });

  // When the client intentionallly disconnects
  socket.on('stop', function(){
    console.log('Stopping qemu (close) ' + connectionInfo.screenPort);
    stopQemu(connectionInfo.screenPort);
  });

  // Routine to cleanup the current qemu process and event listeners
  function stopQemu(screenPort){
    clients.splice(clients.indexOf(connectionInfo), 1);
    admin.emit('remove-client', connectionInfo);
    rfbHandler.stop();
    qemu.stop(screenPort);
    if(vmRunning){
      vmRunning = false;
      availableSessions++;
    }
    socket.emit('machine-closed');
    vm.emit('available-sessions', {sessions: availableSessions});
    admin.emit('available-sessions', {sessions: availableSessions});
  }

  function restartQemu(screenPort){
    stopQemu(screenPort);
    vmRunning = true;
    console.log('restarting on ' + screenPort);
  }

});


/*redisClient.on('connect', function(){
  console.log('redis connected');
});*/

process.on('uncaughtException', function (err) {
    console.log(err);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
