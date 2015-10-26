express = require('express')
path = require('path')
favicon = require('serve-favicon')
logger = require('morgan')
cookieParser = require('cookie-parser')
bodyParser = require('body-parser')
qemu = require('./qemu.js')
RfbHandler = require('./rfb-handler.js')
routes = require('./routes/index')
partials = require('./routes/partials')
api = require('./routes/api')
admin = require('./routes/admin')
app = express()
io = require('socket.io')()
# Number of max sessions available
MAX_SESSIONS = 20
# Current sessions available
availableSessions = MAX_SESSIONS
app.io = io
# view engine setup
app.set 'views', path.join(__dirname, 'views')
app.set 'view engine', 'jade'
# uncomment after placing your favicon in /public
#app.use(favicon(__dirname + '/public/favicon.ico'));
app.use logger('dev')
app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: false)
app.use cookieParser()
app.use express.static(path.join(__dirname, 'public'))
app.use '/bower_components', express.static(path.join(__dirname, 'bower_components'))
app.use '/api', api
app.use '/admin', admin
app.use '/partials', partials
app.use '*', routes
TIMER = 600
clients = []
admin = io.of('/admin')
admin.on 'connection', (socket) ->
  socket.emit 'available-sessions', sessions: availableSessions
  socket.emit 'clients', clients
  return

vm = io.of('/vm')
vm.on 'connection', (socket) ->
  connectionInfo =
    ip: ''
    screenPort: 0
    timer: 0
  console.log "ciaone1"
  connectionInfo.ip = socket.request.connection.remoteAddress
  # Communication handler
  rfbHandler = undefined
  # Sends to the client the number of available sessions
  socket.emit 'available-sessions', sessions: availableSessions
  vmRunning = false
  connectionInfo.timer = TIMER
  timerCallback = undefined
  # Client starts a new vm
  socket.on 'start', (config) ->
    connectionInfo.osTitle = config.title
    connectionInfo.memory = config.memory
    clients.push connectionInfo
    admin.emit 'new-client', connectionInfo
    if availableSessions
      console.log vmRunning
      if vmRunning
        restartQemu connectionInfo.screenPort
      if connectionInfo.timer < TIMER
        connectionInfo.timer = 600
      qemu.start config, (err, port, password) ->
        timerCallback = setInterval((->
          connectionInfo.timer--
          socket.emit 'session-timer', timer: connectionInfo.timer
          if connectionInfo.timer == 0
            stopQemu connectionInfo.screenPort
            socket.emit 'session-expired'
          return
        ), 1000)
        connectionInfo.screenPort = port
        # In RFB protocol the port is: screenPort + 5900
        rfbPort = port + 5900
        console.log 'qemu started on port ' + rfbPort
        availableSessions--
        vm.emit 'available-sessions', sessions: availableSessions
        admin.emit 'available-sessions', sessions: availableSessions
        vmRunning = true
        console.log vmRunning
        rfbHandler = new RfbHandler(socket, rfbPort, password)
        rfbHandler.start()
        return
    return

  # Routine to cleanup the current qemu process and event listeners
  stopQemu = (screenPort) ->
    clients.splice clients.indexOf(connectionInfo), 1
    admin.emit 'remove-client', connectionInfo
    rfbHandler.stop()
    qemu.stop screenPort
    if vmRunning
      vmRunning = false
      availableSessions++
    socket.emit 'machine-closed'
    vm.emit 'available-sessions', sessions: availableSessions
    admin.emit 'available-sessions', sessions: availableSessions
    return

  restartQemu = (screenPort) ->
    stopQemu screenPort
    vmRunning = true
    console.log 'restarting on ' + screenPort
    return

  # When the client accidentally disconnects
  socket.on 'disconnect', ->
    if connectionInfo.screenPort
      console.log 'Stopping qemu (disconnect) ' + connectionInfo.screenPort
      stopQemu connectionInfo.screenPort
    return
  # When the client intentionallly disconnects
  socket.on 'stop', ->
    console.log 'Stopping qemu (close) ' + connectionInfo.screenPort
    stopQemu connectionInfo.screenPort
    return
  return

process.on 'uncaughtException', (err) ->
  console.log err
  return
# catch 404 and forward to error handler
app.use (req, res, next) ->
  err = new Error('Not Found')
  err.status = 404
  next err
  return
# error handlers
# development error handler
# will print stacktrace
if app.get('env') == 'development'
  app.use (err, req, res, next) ->
    res.status err.status or 500
    res.render 'error',
      message: err.message
      error: err
    return
# production error handler
# no stacktraces leaked to user
app.use (err, req, res, next) ->
  res.status err.status or 500
  res.render 'error',
    message: err.message
    error: {}
  return
module.exports = app
