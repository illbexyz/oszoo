var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var term = require('term.js');
var pty = require('pty.js');
var spawn = require('child_process').spawn;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(term.middleware());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(__dirname + '/node_modules/'));

app.use('/', routes);
app.use('/users', users);

server.listen(8081);


io.on('connection', function(socket) {
    //var kvm = spawn('kvm');
    var qemu = spawn('qemu-system-x86_64', ['-cdrom', '~/iso/finnix-110.iso']);

    qemu.stdout.on('data', function(data){
        console.log(data);
    });

    qemu.stderr.on('data', function(data){
        console.log(data);
    });

    qemu.on('close', function(code){
        console.log('child process exited with code ' + code);
    });

    var buff = [];
    var terminal = pty.fork(
        process.env.SHELL || 'sh', 
        [], 
        {
            name: require('fs').existsSync('/usr/share/terminfo/x/xterm-256color')
                ? 'xterm-256color'
                : 'xterm',
            cols: 80,
            rows: 24,
            cwd: process.env.HOME
        }
    );

    terminal.on('data', function(data){
        return !socket ? buff.push(data) : socket.emit('data', data);
    });

    console.log('Created shell with pty master/slave pair (master: %d, pid: %d)', terminal.fd, terminal.pid);
    
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });

    socket.on('data', function(data){
        terminal.write(data);
    });

    socket.on('disconnect', function(){
        socket = null;
    });

    while(buff.length){
        socket.emit('data', buff.shift());
    };
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

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
