const qemu = require('../virtual/qemu');
const rfbHandler = require('../virtual/rfb-handler');

// Seconds before session exipres
const MAX_TIMER = 600;

const vm = ({ socket, onInit }) => {
  let timerInterval = undefined;
  let isRunning = false;
  let rfb = undefined;
  let screenPort = 0;
  let details = {
    ip: undefined,
    timer: MAX_TIMER,
    title: '',
    memory: 0,
  };

  function stop() {
    if (isRunning) {
      clearInterval(timerInterval);
      isRunning = false;
      // state.availableSessions++;
      rfb.stop();
      qemu.stop(screenPort);
      socket.emit('stop');
    }
  }

  function decrementTimer() {
    details.timer--;
    socket.emit('session-timer', { timer: details.timer });
    if (details.timer <= 0) {
      stop();
      socket.emit('session-expired');
    }
  }

  // Callback for the qemu start event
  function onQemuStart(err, port) {
    timerInterval = setInterval(decrementTimer, 1000);
    screenPort = port;
    const rfbPort = 5900 + port;
    isRunning = true;
    rfb = rfbHandler({ socket, port: rfbPort, onInit });
    rfb.start();
  }

  function start(params) {
    console.log('vm socket started');
    details = {
      ...params,
      ip: socket.request.connection.remoteAddress,
      timer: MAX_TIMER,
    };
    console.log(details);
    qemu.start(details, onQemuStart);
  }

  return {
    start,
    stop,
  };
};

const vmController = ({ socket, onInit }) => Object.assign({}, vm({ socket, onInit }));

module.exports = vmController;
