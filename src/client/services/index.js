'use strict';

const app = require('angular').module('OSZoo');

app.service('os', require('./os'));
app.factory('socket', require('./socket'));
app.factory('keysyms', require('./keysyms-codes'));
app.service('vm', require('./vm'));
