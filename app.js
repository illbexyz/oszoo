var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var qemu = require('./qemu.js');
var FrameRenderer = require('./frame-renderer.js');

var routes = require('./routes/index');
var partials = require('./routes/partials');
var api = require('./routes/api');

var app = express();
var io = require('socket.io')();

var availableSessions = 20;

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

app.use('/partials', partials);
//app.use('/computer', computer);
app.use('/api', api);
app.use('*', routes);

io.on('connection', function (socket) {
  var vncport;
  var frameRenderer;
  socket.emit("available-sessions", {sessions: availableSessions});

  socket.on('start', function(config){
    if(availableSessions) {
      var exe;
      if(config.arch == 'x86_64') {
        exe = "qemu-system-x86_64";
      }
      qemu.start(exe, config.memory, config['disk-image'], function(err, port, password){
        vncport = port;
        var rfbPort = port + 5900;
        console.log("qemu started on port " + rfbPort);
        availableSessions--;
        io.emit("available-sessions", {sessions: availableSessions});
        frameRenderer = new FrameRenderer(socket, rfbPort, password);
      });
    }
  });

  socket.on('disconnect', function() {
    if(vncport){
      console.log("Stopping qemu (disconnect)" + vncport);
      stopQemu(vncport);
    }
  });

  socket.on('stop', function(){
    console.log("Stopping qemu (close) " + vncport);
    stopQemu(vncport);
  });

  function stopQemu(vncport){
    frameRenderer.cleanup();
    qemu.stop(vncport);
    socket.emit("machine-closed");
    availableSessions++;
    io.emit("available-sessions", {sessions: availableSessions});
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
