'use strict'
app = require('angular').module('OSZoo')

app.controller 'AdminController', require './admin'
app.controller 'HomeController', require './home'
app.controller 'VmController', require './vm'
app.controller 'ConsoleController', require './console'