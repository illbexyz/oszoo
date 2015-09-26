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
var PNG = require('node-png').PNG;
var streamify = require('stream-array');
var streamifier = require('streamifier');

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
app.use('/users', users);

var chat = io.of('/chat').on('connection', function(socket){
  console.log("a user connected");
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    chat.emit('chat message', msg);
  });
});

var virt = io.of('/virt').on('connection', function(socket){
  socket.on('init', function(config){
    console.log("init");
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
    });
    socket.on('disconnect', function () {
      //disconnectClient(socket);
    });
  });
});

function createRfbConnection(config, socket) {
  /*var r = rfb.createConnection({
    host: config.host,
    port: config.port,
    password: config.password
  });*/
  console.log("creating rfb connection");
  var r = rfb.createConnection({
    host: '127.0.0.1',
    port: '5905'
  });
  addEventHandlers(r, socket);
  return r;
}

function addEventHandlers(r, socket) {
  r.on('connect', function () {
    console.log('vnc connected');
    socket.emit('init', {
      width: r.width,
      height: r.height
    });
    clients.push({
      socket: socket,
      rfb: r
    });
  });
  r.on('rect', function (rect) {
    handleFrame(socket, rect, r);
  });
}

function handleFrame(socket, rect, r) {
  var rgb = new Buffer(rect.width * rect.height * 3, 'binary');
  var offset = 0;
  console.log(rect);
  console.log();
  for (var i = 0; i < rect.data.length; i += 4) {
    rgb[offset++] = rect.data[i + 2];
    rgb[offset++] = rect.data[i + 1];
    rgb[offset++] = rect.data[i];
  }

  streamifier.createReadStream(rect.data).pipe(new PNG())
  .on('parsed', function(){
    image = image.encodeSync();
    socket.emit('frame', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      image: image.toString('base64')
    });
  });
  //var image = new Png(rgb, r.width, r.height, 'rgb');
}

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
