module.exports = function socket() {
  return (path) => {
    const io = require('socket.io-client');
    const url = `${location.origin}/${path}`;
    const sock = io.connect(url);
    return sock;
  };
};
