const controller = require('./controller');
const qemu = require('../virtual/qemu');
const stampit = require('stampit');
const RfbHandler = require('../virtual/rfb-handler');

// Seconds before session exipres
const MAX_TIMER = 600;

// sessionDetails = {
//   ip: '',
//   timer: 0,
//   title: '',
//   memory: 0,
//   screenPort: 0
// };

const vm = stampit({
  refs: {
    session: undefined,
    timerInterval: undefined,
    vmIsRunning: false,
    rfbHandler: undefined
  },
  methods: {
    initSession(details) {
      this.session = {};
      this.session.ip = this.socket.request.connection.remoteAddress;
      this.session.timer = MAX_TIMER;
      this.session.title = details.title;
      this.session.memory = details.memory;
    },

    decrementTimer() {
      this.session.timer--;
      this.socket.emit('session-timer', {timer: this.session.timer});
      if(this.session.timer <= 0) {
        this.stop();
        this.socket.emit('session-expired');
      }
    },

    start(config) {
      this.initSession({
        title: config.title,
        memory: config.memory
      });
      this.state.activeSessions.push(this.session);
      if(this.state.availableSessions > 0) {
        if(this.vmIsRunning)
          this.stop();
        qemu.start(config, this.onQemuStart.bind(this));
      }
    },

    // Callback for the qemu start event
    onQemuStart(err, port) {
      this.timerInterval = setInterval(this.decrementTimer.bind(this), 1000);
      this.session.screenPort = port;
      const rfbPort = 5900 + port;
      this.state.availableSessions--;
      this.vmIsRunning = true;
      this.rfbHandler = RfbHandler(this.socket, rfbPort);
      this.rfbHandler.start();
    },

    stop() {
      if(this.vmIsRunning) {
        this.state.activeSessions.splice(
          this.state.activeSessions.indexOf(this.session), 1
        );
        clearInterval(this.timerInterval);
        this.vmIsRunning = false;
        this.state.availableSessions++;
        this.rfbHandler.stop();
        qemu.stop(this.session.screenPort);
        this.socket.emit('stop');
      }
    }
  }
});

const vmController = (config) => {
  return stampit().compose(controller(config), vm)();
};

module.exports = vmController;