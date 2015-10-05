var app = angular.module('OSZoo', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.config(function($mdThemingProvider, $routeProvider, $locationProvider) {
	$routeProvider.when('/',{
		templateUrl: 'partials/home',
		controller: 'HomeController'
	})
	.when('/computer', {
		templateUrl: 'partials/computer',
		controller: "ComputerController"
	})
	.otherwise({
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

app.controller('HomeController', function($scope, $http){
	/*$scope.osList = 	[	{title: "Finnix", id: 0},
											{title: "Ubuntu", id: 1},
											{title: "Debian", id: 2}
										];*/
	$http.get('/api/os').then(function(response){
		console.log(response.data);
		$scope.osList = response.data;
	});
});

app.controller('ComputerController', function($scope, $timeout) {
	$scope.focus = "";
	$scope.isLoading = true;
	var socket;
	
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

	$scope.init = function() {
		var url = location.origin;
		socket = io.connect(url, {'force new connection': true});

		var canvas = document.getElementById('screen');

		var ctx = canvas.getContext('2d');

		socket.on('init', function(data){
			canvas.width = data.width;
			canvas.height = data.height;
			document.addEventListener("mousemove", handleMouseMove);
	  	document.addEventListener('keydown', handleKeydown);
		});

		socket.on('frame', function (data) {
			var image = new Image();
			var blob = new Blob([data.image], {type: 'image/jpeg'});
			var urlBlob = URL.createObjectURL(blob);

			var uInt8Array = new Uint8Array(data.image);
	    //var uInt8Array = imgData;
	    var i = uInt8Array.length;
	    var binaryString = [i];
	    while (i--) {
	        binaryString[i] = String.fromCharCode(uInt8Array[i]);
	    }
	    var bdata = binaryString.join('');

	    var base64 = window.btoa(bdata);

			image.src = 'data:image/jpeg;base64,' + base64;
			image.onload = function() {
				ctx.drawImage(image, data.x, data.y, data.width, data.height);
				$scope.$apply(function(){
					$scope.isLoading = false;
				});
			}
		});

	  socket.emit('start');
	}

	$scope.init();
	$scope.$on("$destroy", function() {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener('keydown', handleKeydown);
		socket.emit('close');
		//socket.disconnect();
		//socket.close();
  });

	function handleMouseMove(event) {
    var dot, eventDoc, doc, body, pageX, pageY;

    event = event || window.event; // IE-ism

    // If pageX/Y aren't available and clientX/Y are,
    // calculate pageX/Y - logic taken from jQuery.
    // (This is to support old IE)
    if (event.pageX == null && event.clientX != null) {
      eventDoc = (event.target && event.target.ownerDocument) || document;
      doc = eventDoc.documentElement;
      body = eventDoc.body;

      event.pageX = event.clientX +
        (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
        (doc && doc.clientLeft || body && body.clientLeft || 0);
      event.pageY = event.clientY +
        (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
        (doc && doc.clientTop  || body && body.clientTop  || 0 );
    }

    socket.emit('mouse', {x: event.pageX, y: event.pageY});
  }

  function handleKeydown(event){
  	console.log(event.keyCode + " " + isCapslock(event));
  	socket.emit('keydown', {key: codeConvert(event.keyCode)});
  }

  function isCapslock(e){
    e = (e) ? e : window.event;

    var charCode = false;
    if (e.which) {
        charCode = e.which;
    } else if (e.keyCode) {
        charCode = e.keyCode;
    }

    var shifton = false;
    if (e.shiftKey) {
        shifton = e.shiftKey;
    } else if (e.modifiers) {
        shifton = !!(e.modifiers & 4);
    }
    console.log("shifton: " + shifton);
    if (charCode >= 97 && charCode <= 122 && shifton) {
        return false;
    }

    if (charCode >= 65 && charCode <= 90 && shifton) {
        return true;
    }

    return false;
	}
});