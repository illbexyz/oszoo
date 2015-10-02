var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var redis = require('redis');
//var redisClient = redis.createClient();

var qemu = require('./qemu.js');
var FrameRenderer = require('./frame-renderer.js');

var routes = require('./routes/index');
var computer = require('./routes/computer');

var app = express();
var io = require('socket.io')();

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

app.use('/', routes);
app.use('/computer', computer);

io.on('connection', function (socket) {
  //console.log("starting qemu...");

  qemu.start('qemu-system-x86_64', '256', 'image.img', function(err, port, password){
    if(err){
      console.error(err.toString('utf8'));
      //qemu.stop();
    }
    var rfbPort = port + 5900;
    console.log("qemu started on port " + rfbPort);
    var frameRenderer = new FrameRenderer(socket, rfbPort, password);

    socket.on('disconnect', function() {
      qemu.stop(port);
    });

  });
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
