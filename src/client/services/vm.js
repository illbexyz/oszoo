module.exports = function vm(socket) {
  return {
    running: false,
    os: undefined,
    vmSocket: socket('vm'),

    start(os, cb = () => {}) {
      if (this.running) {
        this.restart(os, cb);
      } else {
        this.vmSocket.emit('start', os);
        this.vmSocket.once('init', () => {
          this.running = true;
          this.os = os;
          cb();
        });
      }
    },

    stop(cb = () => {}) {
      this.vmSocket.emit('stop');
      this.vmSocket.once('stop', () => {
        this.running = false;
        this.os = undefined;
        cb();
      });
    },

    restart(os, cb) {
      this.stop(() => {
        this.start(os, cb);
      });
    },

  };
};
