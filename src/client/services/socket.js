'use strict';

//----------------------------------------------------------------------------//
//-------------------------- Socket.io Factory -------------------------------//
//----------------------------------------------------------------------------//

module.exports = function() {
  return (path) => {
    const io = require('socket.io-client');
    const url = location.origin + '/' + path;
    const socket = io.connect(url);
    return socket;
  };
};