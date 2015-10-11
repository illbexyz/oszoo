var app = angular.module('OSZoo', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('green');

  //$locationProvider.html5Mode(true);
});

app.service("os", function($http){

  function getList() {
    var request = $http.get('/api/os');
    return request.then(successHandler, failureHandler);
  }

  function successHandler(response) {
    return response.data;
  }

  function failureHandler(response) {
    console.error("error getting the os list");
  }

  return {getList: getList};

});

app.factory('socket', function(){
  var url = location.origin;
  var socket = io.connect(url);
  return socket;
});

app.controller('HomeController', function($scope, $mdSidenav, os, socket, $rootScope){

  $scope.vmIsRunning = false;
  $scope.sessionsAvailable;
  $scope.osList;

  os.getList().then(function(osList){
    $scope.osList = osList;
  });

  socket.on('available-sessions', function(data){
    $scope.sessionsAvailable = data.sessions;
    $scope.$apply();
  });

  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

  $scope.title = "Select an OS";

  $scope.changeOS = function(os){
    $scope.title = os.title;
    $scope.$broadcast("start-os-loading", os);
	}

  $scope.$on("first-frame", function(event, data) {
    $scope.$broadcast('stop-os-loading');
    $scope.vmIsRunning = true;
    var canvas = document.getElementById("screen");
    canvas.focus();
  });
});

app.controller('VmController', function($scope, $timeout, $http, $interval, $rootScope, os, socket) {
  // Variables
  var mouseDown = 0;
  // Timer in seconds
  var timer = 600;

  // Scope variables
  $scope.vmIsRunning = false;
  // String timer
  $scope.timer = "10:00";

  // Initialize the socket
  //initializeTimer();
  initializeSocket();

  $scope.$on("start-os-loading", function(event, os) {
    if(!$scope.vmIsRunning){
      socket.emit('start', os);
    } else {
      socket.emit('stop');
      socket.on('machine-closed', function() {
        $scope.vmIsRunning = false;
        $scope.changeOS(os);
      });
    }
  });

  document.addEventListener('keydown', function(e){
        // if(e.keyCode == 8) {
        //   e.preventDefault();
        // }
      });

  $interval(function () {
    timer--;
    $scope.timer = timerToString(timer);
  }, 1000);

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
		var canvas = document.getElementById('screen');
    canvas.tabIndex = 1000;
		var ctx = canvas.getContext('2d');

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
        $rootScope.$broadcast("first-frame");
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

app.controller('ConsoleController', function($scope, $http, $interval, $rootScope) {

  $scope.userInput = "";
  $scope.loadingSymbol = "|";

  $http.get('/api/os').then(function(response){
    $scope.osList = response.data;
  });
  var consoleElement = document.getElementById("consoleBody");

  var intervalPromise = runInputHint();

  $scope.$on('start-os-loading', function(event, os) {
    $scope.isLoading = true;
    runLoading();
  });

  $scope.$on('stop-os-loading', function(event, data) {
    $scope.isLoading = false;
    stopLoading();
  });

  $scope.enterPress = function(){
    command();
  }

  $scope.setFocus = function() {
    document.getElementById("consoleInput").focus();
  }

  document.getElementById("consoleInput").onfocus = function(){
    if($scope.userInput == "_") {
      $scope.userInput = "";
    }
    $interval.cancel(intervalPromise);
  }

  document.getElementById("consoleInput").onblur = function(){
    if($scope.userInput == "") {
      intervalPromise = runInputHint();
    }
  }

  function runLoading(){
    console.log("emme!");
    $interval(loadingAnimation, 80);
  }

  function stopLoading() {
    $interval.cancel(loadingAnimation);
  }

  function runInputHint() {
    return $interval(function(){
      if($scope.userInput == "") {
        $scope.userInput = "_";
      } else if($scope.userInput == "_"){
        $scope.userInput = "";
      }
    }, 1000);
  }

  function loadingAnimation(){
    switch($scope.loadingSymbol){
      case "|":
        $scope.loadingSymbol = "/";
        break;
      case "/":
        $scope.loadingSymbol = "-";
        break;
      case "-":
        $scope.loadingSymbol = "\\";
        break;
      case "\\":
        $scope.loadingSymbol = "|";
        break;
    }
  }

  function command(){
    var input = document.getElementById("consoleInput");
    var spanReplace = document.createElement("span");
    spanReplace.appendChild(document.createTextNode(input.value));
    consoleElement.appendChild(spanReplace);
    switch($scope.userInput){
      case "oslist":
        printOsList();
        break;
      case "doge":
        print("Such command, very useful, wow.");
        break;
      default:
        var osToLaunch = null;
        for(key in $scope.osList){
          if($scope.userInput == $scope.osList[key].consoleTitle){
            osToLaunch = $scope.osList[key];
          }
        }
        if(osToLaunch){
          $rootScope.$broadcast("start-os-loading", osToLaunch);
          print("Wait for the magic to happen...");
        } else {
          var p = document.createElement("p");
          p.appendChild(document.createTextNode("Sorry, I can't help you with that."));
          consoleElement.appendChild(p);
        }
        break;
    }
    $scope.userInput = "";
    var span = document.createElement("span");
    span.appendChild(document.createTextNode("user:~ "));
    consoleElement.appendChild(span);
    consoleElement.appendChild(input);
    input.focus();
  }

  function print(string) {
    var p = document.createElement('p');
    p.appendChild(document.createTextNode(string));
    consoleElement.appendChild(p);
  }

  function printOsList(){
    var p = document.createElement('p');
    var table = document.createElement('table');
    table.setAttribute("class", "consoleHighlight");
    var tr = document.createElement('tr');
    for(key in $scope.osList){
      var td = document.createElement('td');
      td.appendChild(document.createTextNode($scope.osList[key].consoleTitle));
      tr.appendChild(td);
    }
    table.appendChild(tr);
    p.appendChild(table);
    consoleElement.appendChild(p);
  }

});

app.directive('enterPress', function(){
  return function(scope, element, attrs){
    element.bind("keydown keypress", function(event){
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.enterPress);
        });
        event.preventDefault();
      }
    });
  }
});

// app.directive('oszooTimer', function() {
//   return {
//     restrict: 'E',
//     templateUrl: '<span> Ciao </span>'
//   };
// });
// '<span class="md-accent"> {{timer}} <md-tooltip> Time remaining</md-tooltip></span>'
