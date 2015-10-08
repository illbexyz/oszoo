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
  var mouseDown = 0;
	var socket;
  // Timer in seconds
  var timer = 600;
  // The client is waiting for initialization
  var isLoading;

  // Scope variables
  $scope.vmIsRunning = false;
  // String timer
  $scope.timer = "10:00";
  $scope.sessionsAvailable;
  $scope.title = "Select an OS";

  // Initialize the os list
  $http.get('/api/os').then(function(response){
		$scope.osList = response.data;
	});
  // Initialize the socket
  //initializeTimer();
  initializeSocket();

  document.addEventListener('keydown', function(e){
        console.log(e.keyCode);
        if(e.keyCode == 8) {
          e.preventDefault();
        }
      });

  $interval(function () {
    timer--;
    $scope.timer = timerToString(timer);
  }, 1000);

  /**  */
  $scope.changeOS = function(os){
    if(!$scope.vmIsRunning){
      socket.emit('start', os);
      $scope.title = os.title;
    } else {
      socket.emit('stop');
      socket.on('machine-closed', function() {
        $scope.vmIsRunning = false;
        $scope.changeOS(os);
      });
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
    return minutes + ":" + seconds;
  }

  function initializeSocket() {
		var url = location.origin;
		socket = io.connect(url);

		var canvas = document.getElementById('screen');
    canvas.tabIndex = 1000;
		var ctx = canvas.getContext('2d');

    socket.on('available-sessions', function(data){
      $scope.sessionsAvailable = data.sessions;
      $scope.$apply();
    });

		socket.on('init', function(data){
			canvas.width = data.width;
			canvas.height = data.height;
	  	canvas.addEventListener('keydown',    handleKeydown);
      canvas.addEventListener("mousedown",  handleMouseDown);
      canvas.addEventListener("mouseup",    handleMouseUp);
      canvas.addEventListener("mousemove",  handleMouseMove);
      $scope.vmIsRunning = true;
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
      if(data.width == 640 && data.height == 480) {
        canvas.width = 640;
        canvas.height = 480;
      }
			image.src = 'data:image/jpeg;base64,' + base64;
			image.onload = function() {
				ctx.drawImage(image, data.x, data.y, data.width, data.height);
			}
		});
	}

  document.body.onmousedown = function() {
    mouseDown = 1;
  }
  document.body.onmouseup = function() {
    mouseDown = 0;
  }

  $scope.stopMachine = function(){
    socket.emit('stop');

  }

	$scope.$on("$destroy", function() {
		canvas.removeEventListener("mousemove", handleMouseMove);
		canvas.removeEventListener('keydown',   handleKeydown);
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mouseup",   handleMouseUp);
		socket.emit('close');
  });

	function handleMouseMove(e) {
    var pos = getMousePositionOnCanvas(e);
    socket.emit('mouse', {x: pos.x, y: pos.y, isDown: mouseDown});
  }

  function handleMouseDown(e){
    var pos = getMousePositionOnCanvas(e);
    socket.emit('mouse', {x: pos.x, y: pos.y, isDown: 1});
  }

  function handleMouseUp(e){
    var pos = getMousePositionOnCanvas(e);
    socket.emit('mouse', {x: pos.x, y: pos.y, isDown: 0});
  }

  function getMousePositionOnCanvas(e){
    var mouseX, mouseY;

    if(e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    } else if(e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    return {x: mouseX, y:mouseY};
  }

  function handleKeydown(event){
    if(event.keyCode == 8){
      console.log('coso');
      event.preventDefault();
    }
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

app.controller('ConsoleController', function($scope) {

  var mConsole = new Console(800, 600);

  //var canvas = document.getElementById("console");
  var canvas = mConsole.getCanvas();
  var frame = document.getElementById("frame");
  frame.appendChild(canvas);

  mConsole.write("Welcome to OS Zoo!");

});

// app.directive('oszooTimer', function() {
//   return {
//     restrict: 'E',
//     templateUrl: '<span> Ciao </span>'
//   };
// });
// '<span class="md-accent"> {{timer}} <md-tooltip> Time remaining</md-tooltip></span>'
