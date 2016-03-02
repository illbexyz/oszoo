const controller = require('./controller');

const admin = () => {
  this.socket.emit('clients', { clients: this.state.activeSessions });
};

const adminController = (config) => Object.assign({}, controller(config), admin());

module.exports = adminController;
