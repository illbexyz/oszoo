'use strict';

const app = require('angular').module('OSZoo');

app.controller('AdminController', ['$scope', '$mdDialog', 'os', 'socket', require('./admin')]);
app.controller('HomeController', ['$scope', '$mdDialog', '$mdToast', '$mdSidenav', 'os', 'socket', require('./home')]);
app.controller('VmController', ['$scope', '$rootScope', 'os', 'socket', 'keysyms', require('./vm')]);
app.controller('ConsoleController', ['$scope', '$http', '$interval', '$rootScope', require('./console')]);