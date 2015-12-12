'use strict';

//----------------------------------------------------------------------------//
//-------------------------- Socket.io Factory -------------------------------//
//----------------------------------------------------------------------------//

module.exports = function() {
  const io = require('socket.io-client');
  const url = location.origin + '/vm';
  const socket = io.connect(url);
  return socket;
};