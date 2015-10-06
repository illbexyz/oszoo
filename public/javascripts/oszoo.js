var app = angular.module('OSZoo', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('deep-orange');

  //$locationProvider.html5Mode(true);
});

app.controller('OSZooController', ['$scope', '$mdSidenav', function($scope, $mdSidenav){
  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

}]);

app.controller('ComputerController', function($scope, $timeout, $http, $interval) {
  // Variables
  var aMachineisRunning = false;
  var mouseDown = 0;
	var socket;
  var timer = 600;
  var timerString;
  var isLoading;

  // Scope variables
  $scope.isLoading = true;

  $scope.timer = "10:00";
  $scope.sessions;
  $scope.title = "Select an OS";

  // Initialize the os list
  $http.get('/api/os').then(function(response){
		$scope.osList = response.data;
	});
  // Initialize the socket
  //initializeTimer();
  initializeSocket();

  $interval(function () {
    timer--;
    $scope.timer = timerToString(timer);
    $scope.isLoading = isLoading
    console.log($scope.timer);
  }, 1000);

  $scope.changeOS = function(os){
    if(aMachineisRunning) {
      socket.emit('stop');
      socket.on('machine-closed', function() {
        socket.emit('start', os);
        $scope.title = os.title;
        socket.removeAllListeners('machine-closed');
      });
    } else {
  		socket.emit('start', os);
      $scope.title = os.title;
    }
	}

  function timerToString(timer){
    var minutes = "" + Math.floor(timer / 60);
    var seconds = "" + timer % 60;
    if(minutes.length == 1) {
      minutes = "0" + minutes;
    }
    if(seconds.length == 1) {
      seconds = "0" + seconds;
    }
    timerString = minutes + ":" + seconds;
    return timerString;
  }

  function initializeSocket() {
		var url = location.origin;
		socket = io.connect(url);

		var canvas = document.getElementById('screen');
    canvas.tabIndex = 1000;
		var ctx = canvas.getContext('2d');

    socket.on('available-sessions', function(data){
      $scope.sessions = data.sessions;
      $scope.$apply();
    });

		socket.on('init', function(data){
			canvas.width = data.width;
			canvas.height = data.height;
			canvas.addEventListener("mousemove", handleMouseMove);
	  	canvas.addEventListener('keydown', handleKeydown);
		});

		socket.on('frame', function (data) {
			var image = new Image();
			var blob = new Blob([data.image], {type: 'image/jpeg'});
			var urlBlob = URL.createObjectURL(blob);

			var uInt8Array = new Uint8Array(data.image);
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
				isLoading = false;
        aMachineisRunning = true;
			}
		});
	}

  document.body.onmousedown = function() {
    ++mouseDown;
  }
  document.body.onmouseup = function() {
    --mouseDown;
  }

  $scope.stopMachine = function(){
    socket.emit('stop');

  }

	$scope.$on("$destroy", function() {
		canvas.removeEventListener("mousemove", handleMouseMove);
		canvas.removeEventListener('keydown', handleKeydown);
		socket.emit('close');
  });

	function handleMouseMove(e) {
    var mouseX, mouseY;

    if(e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if(e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    socket.emit('mouse', {x: mouseX, y: mouseY, isDown: mouseDown});
  }

  function handleKeydown(event){
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
    if (charCode >= 97 && charCode <= 122 && shifton) {
        return false;
    }

    if (charCode >= 65 && charCode <= 90 && shifton) {
        return true;
    }

    return false;
	}
});

// app.directive('oszooTimer', function() {
//   return {
//     restrict: 'E',
//     templateUrl: '<span> Ciao </span>'
//   };
// });
// '<span class="md-accent"> {{timer}} <md-tooltip> Time remaining</md-tooltip></span>'
