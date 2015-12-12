const controller = require('./controller');
const stampit = require('stampit');

const admin = stampit().init(function(){
  this.socket.emit('clients', {clients: this.state.activeSessions});
});

let adminController = (config) => {
  return stampit().compose(controller(config), admin)();
};

module.exports = adminController;