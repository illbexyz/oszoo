var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require("socket.io")(server);

var spawn = require('child_process').spawn;
var rfb = require('rfb2');
var Png = require('png').Png;

clients = [];

server.listen(80);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

var virt = io.of('/vnc').on('connection', function(socket){
  socket.on('init', function(config){
    console.info("init");
    var memory = '256';
    var cdrom = "~/iso/ubuntu-gnome-15.04-desktop-amd64.iso";
    var hda = '~/iso/prova.img';
    /*var kvm = spawn('kvm', [
      '-m', memory,
      '-hda', hda,
      '-cdrom', cdrom,
      '-vnc', '127.0.0.1:5'
      ]);
    kvm.stdout.on('data', function(data){
      console.log("data: " + data);
    });
    kvm.stderr.on('data', function(data){
      console.log("error: " + data);
    });
    */
    var r = createRfbConnection(config, socket);
    socket.on('mouse', function (evnt) {
      r.pointerEvent(evnt.x, evnt.y, evnt.button);
    });
    socket.on('keyboard', function (evnt) {
      r.keyEvent(evnt.keyCode, evnt.isDown);
      console.info('Keyboard input');
    });
    socket.on('disconnect', function () {
      disconnectClient(socket);
      console.info('Client disconnected');
    });
  });
});

function encodeFrame(rect) {
  var rgb = new Buffer(rect.width * rect.height * 3, 'binary');
  var offset = 0;

  for (var i = 0; i < rect.data.length; i += 4) {
    rgb[offset] = rect.data[i + 2];
    offset += 1;
    rgb[offset] = rect.data[i + 1];
    offset += 1;
    rgb[offset] = rect.data[i];
    offset += 1;
  }
  var image = new Png(rgb, rect.width, rect.height, 'rgb');
  return image.encodeSync();
}

function addEventHandlers(r, socket) {
  var initialized = false;
  var screenWidth;
  var screenHeight;

  function handleConnection(width, height) {
    screenWidth = width;
    screenHeight = height;
    console.info('RFB connection established');
    socket.emit('init', {
      width: width,
      height: height
    });
    clients.push({
      socket: socket,
      rfb: r,
      interval: setInterval(function () {
        r.requestUpdate(false, 0, 0, width, height);
      }, 50)
    });
    //r.requestUpdate();
    initialized = true;
  }

  r.on('error', function (e) {
    console.error('Error while talking with the remote RFB server', e);
  });

  r.on('rect', function (rect) {
    if (!initialized) {
      handleConnection(rect.width, rect.height);
    }
    socket.emit('frame', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      image: encodeFrame(rect).toString('base64')
    });
    r.requestUpdate(false, 0, 0, screenWidth, screenHeight);
  });

  r.on('*', function () {
    console.error(arguments);
  });
}

function createRfbConnection(config, socket) {
  var r;
  try {
    r = rfb.createConnection({
      host: '192.168.1.108',
      port: '5900',
      password: '1234',
      //securityType: 'vnc',
    });
    setTimeout(function () {
      r.requestUpdate(false, 0, 0);
    }, 200);
  } catch (e) {
    console.log(e);
  }
  addEventHandlers(r, socket);
  return r;
}

function disconnectClient(socket) {
  clients.forEach(function (client) {
    if (client.socket === socket) {
      client.rfb.end();
      clearInterval(client.interval);
    }
  });
  clients = clients.filter(function (client) {
    return client.socket === socket;
  });
}

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
