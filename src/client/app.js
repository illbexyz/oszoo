//----------------------------------------------------------------------------//
//------------------------- Module configuration -----------------------------//
//----------------------------------------------------------------------------//
'use strict';

const angular = require('angular');
require('angular-material');
require('angular-route');
require('angular-animate');
require('angular-aria');

const app = angular.module('OSZoo', [
  'ngMaterial',
  'ngAnimate',
  'ngRoute'
]);

app.config(($mdThemingProvider) => {
  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('green');
});

require('./services');
require('./directives');
require('./controllers');