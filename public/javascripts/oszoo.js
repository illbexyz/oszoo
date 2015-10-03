var app = angular.module('OSZoo', ['ngMaterial', 'ngAnimate']);

app.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('light-blue');
});

app.controller('OSZooController', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };
 
}]);

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