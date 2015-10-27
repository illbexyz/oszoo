express = require('express')
path = require('path')
favicon = require('serve-favicon')
logger = require('morgan')
cookieParser = require('cookie-parser')
bodyParser = require('body-parser')
qemu = require('./qemu.coffee')
RfbHandler = require('./rfb-handler.coffee')
routes = require('./routes/index')
partials = require('./routes/partials')
api = require('./routes/api')
admin = require('./routes/admin')
app = express()
io = require('socket.io')()
app.io = io

#------------------------------------------------------------------------------#
#-------------------------------- Constants -----------------------------------#
#------------------------------------------------------------------------------#

# Seconds before session exipres
MAX_TIMER = 600
# Number of max sessions available
MAX_SESSIONS = 20

# view engine setup
app.set 'views', path.join(__dirname, 'views')
app.set 'view engine', 'jade'
# uncomment after placing your favicon in /public
#app.use(favicon(__dirname + '/public/favicon.ico'));

#------------------------------------------------------------------------------#
#------------------------------- Middlewares ----------------------------------#
#------------------------------------------------------------------------------#

app.use logger('dev')
app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: false)
app.use cookieParser()
app.use require('coffee-middleware') src: "#{__dirname}/public"
app.use express.static(path.join(__dirname, 'public'))
app.use '/bower_components', express.static(path.join(__dirname, 'bower_components'))
app.use '/api', api
app.use '/admin', admin
app.use '/partials', partials
app.use '*', routes

#------------------------------------------------------------------------------#
#----------------------------- Global variables -------------------------------#
#------------------------------------------------------------------------------#

# List containing infos for each session
activeSessions = []
# Current sessions available
availableSessions = new Number(MAX_SESSIONS)

#------------------------------------------------------------------------------#
#---------------------------------- Classes -----------------------------------#
#------------------------------------------------------------------------------#

# Abstract Controller class
class Controller

  constructor: (socket) ->
    @socket = socket
    @initialize()

  emitSessions: ->
    @socket.emit 'available-sessions', sessions: availableSessions

# Controller for the Admin page
class AdminController extends Controller

  initialize: ->
    @emitSessions()
    @socket.emit 'clients', activeSessions
    return

# Controller for the VM (home) page
class VmController extends Controller

  initialize: ->
    @vmIsRunning = false
    @qemu = qemu
    @sessionDetails = {
      ip: @socket.request.connection.remoteAddress
      timer: MAX_TIMER
      osTitle: ''
      memory: 0
      screenPort: 0
    }
    @emitSessions()
    # When the client starts a new vm
    @socket.on 'start', @launchVm.bind(this)
    # When the client accidentally disconnects
    @socket.on 'disconnect', @stopQemu.bind(this)
    # When the client intentionally disconnects
    @socket.on 'stop', @stopQemu.bind(this)

  # Launch a new qemu vm
  launchVm: (config) ->
    @sessionDetails.osTitle = config.title
    @sessionDetails.memory = config.memory
    activeSessions.push @sessionDetails
    admin.emit 'new-client', @sessionDetails
    if availableSessions > 0
      # If a vm is running in this session already, stops it
      if @vmIsRunning
        @stopQemu()
      qemu.start config, @onQemuStart.bind(this)
    return

  # Callback for the qemu start event
  onQemuStart: (err, port) ->
    # Start the timer
    setInterval @decrementTimer.bind(this), 1000
    @sessionDetails.screenPort = port
    # By RFB protocol, the actual port is 5900 + screenPort
    rfbPort = 5900 + port
    availableSessions--
    vm.emit 'available-sessions', sessions: availableSessions
    admin.emit 'available-sessions', sessions: availableSessions
    @vmIsRunning = true
    @rfbHandler = new RfbHandler(@socket, rfbPort).start()
    return

  # Stop the running vm
  stopQemu: ->
    if @vmIsRunning
      activeSessions.splice activeSessions.indexOf(@sessionDetails), 1
      @sessionDetails.timer = 600
      @vmIsRunning = false
      availableSessions++
      @rfbHandler.stop()
      qemu.stop @sessionDetails.screenPort
      # Send the information to the client/s
      @socket.emit 'machine-closed'
      vm.emit 'available-sessions', sessions: availableSessions
      admin.emit 'available-sessions', sessions: availableSessions
      admin.emit 'remove-client', @sessionDetails
    return

  # Decrement the timer and alerts the client
  decrementTimer: ->
    @sessionDetails.timer--
    @socket.emit 'session-timer', timer: @sessionDetails.timer
    if @sessionDetails.timer <= 0
      @stopQemu()
      @socket.emit 'session-expired'
    return

#------------------------------------------------------------------------------#
#----------------------------------- Body -------------------------------------#
#------------------------------------------------------------------------------#

admin = io.of('/admin')
admin.on 'connection', (socket) ->
  new AdminController socket
  return

vm = io.of('/vm')
vm.on 'connection', (socket) ->
  new VmController socket
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
