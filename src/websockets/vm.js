const controller = require('./controller')
const qemu = require('../virtual/qemu')
const stampit = require('stampit')
const RfbHandler = require('../virtual/rfb-handler')

// Seconds before session exipres
const MAX_TIMER = 600

const sessionDetails = {
  ip: '',
  timer: 0,
  osTitle: '',
  memory: 0,
  screenPort: 0
}

const vm = stampit({
  refs: {
    session: undefined,
    timerInterval: undefined,
    vmIsRunning: false,
    rfbHandler: undefined,
  },
  methods: {
    initSession(details) {
      console.log('init session')
      this.session = {}
      this.session.ip = this.socket.request.connection.remoteAddress
      this.session.timer = MAX_TIMER
      this.session.osTitle = details.osTitle
      this.session.memory = details.memory
    },

    decrementTimer() {
      this.session.timer--
      this.socket.emit('session-timer', {timer: this.session.timer})
      if(this.session.timer <= 0) {
        this.stop()
        this.socket.emit('session-expired')
      }
    },

    start(config) {
      console.log('start')
      this.initSession({
        osTitle: config.osTitle,
        memory: config.memory
      })
      this.state.activeSessions.push(this.session)
      if(this.state.availableSessions > 0) {
        if(this.vmIsRunning)
          this.stop()
        qemu.start(config, this.onQemuStart.bind(this))
      }
      console.log('start finished')
    },

    // Callback for the qemu start event
    onQemuStart(err, port) {
      console.log('------- on qemu start ------')
      this.timerInterval = setInterval(this.decrementTimer.bind(this), 1000)
      this.session.screenPort = port
      const rfbPort = 5900 + port
      console.log('port in onQemuStart: ' + rfbPort)
      this.state.availableSessions--
      this.vmIsRunning = true
      this.rfbHandler = RfbHandler(this.socket, rfbPort)
      this.rfbHandler.start()
    },

    stop() {
      console.log('stop')
      if(this.vmIsRunning) {
        this.state.activeSessions.splice(
          this.state.activeSessions.indexOf(this.session), 1
        )
        clearInterval(this.timerInterval)
        this.vmIsRunning = false
        this.state.availableSessions++
        this.rfbHandler.stop()
        qemu.stop(this.session.screenPort)
        this.socket.emit('machine-closed')
      }
    },
  }
});

const vmController = (config) => {
  return stampit().compose(controller(config), vm)();
}

module.exports = vmController