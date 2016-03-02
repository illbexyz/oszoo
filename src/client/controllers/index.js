'use strict';

const app = require('angular').module('OSZoo');

app.controller('AdminController', ['$scope', '$mdDialog', 'os', 'socket', require('./admin')]);
app.controller('HomeController',
  ['$scope', '$mdDialog', '$mdToast', '$mdSidenav', 'os', 'socket', 'vm', require('./home')]);
app.controller('VmController',
  ['$scope', '$rootScope', 'os', 'socket', 'keysyms', 'vm', require('./vm')]);
app.controller('ConsoleController',
  ['$scope', '$http', '$interval', 'vm', require('./console')]);
