// const sessionEmitter = () => {
//   this.socket.emit('available-sessions', { sessions: this.state.availableSessions });
// };

const socketController = ({ socket }) => Object.assign({}, { socket });

module.exports = socketController;
