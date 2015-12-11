const stampit = require('stampit');

const sessionEmitter = stampit().init(function() {
  this.socket.emit('available-sessions', {sessions: this.state.availableSessions})
});

const controller = (config) => {
  const refs = stampit().refs({
    socket: config.socket,
    state: config.state
  });
  return stampit().compose(sessionEmitter, refs);
}

module.exports = controller;