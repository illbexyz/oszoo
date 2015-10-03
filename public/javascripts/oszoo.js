var app = angular.module('OSZoo', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.config(function($mdThemingProvider, $routeProvider, $locationProvider) {
	$routeProvider.when('/',{
		templateUrl: 'partials/home',
		controller: 'HomeController'
	}).otherwise({
		redirectTo: '/'
	});

  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('light-blue');

  $locationProvider.html5Mode(true);
});

app.controller('OSZooController', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
 
}]);

app.controller('HomeController', function($scope){

});

app.controller('ScreenController', function($scope, $timeout) {
	$scope.focus = "";
	
	$scope.setFocus = function() {
		if($scope.focus == ""){
			$scope.focus = 'screenFocus'
		} else {
			$scope.focus = "";
		}
		$timeout(function(){
			$scope.focus = "";
		}, 100);
	}

});