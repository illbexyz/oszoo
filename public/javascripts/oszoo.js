var app = angular.module('OSZoo', ['ngMaterial', 'ngAnimate', 'ngRoute']);

app.config(function($mdThemingProvider) {

  $mdThemingProvider.theme('default')
    .primaryPalette('indigo')
    .accentPalette('green');

  //$locationProvider.html5Mode(true);
});

app.service("os", function($http){

  var url = '/api/os';

  function getList() {
    var request = $http.get(url);
    return request.then(successHandler, failureHandler);
  }

  function post(os) {
    var request = $http.post(url, os);
    return request.then(successHandler, failureHandler);
  }

  function put(os) {
    var request = $http.put(url, os);
    return request.then(successHandler, failureHandler);
  }

  function deletea(os) {
    var deleteUrl = url + '/' + os.id;
    var request = $http.delete(deleteUrl);
    return request.then(successHandler, failureHandler);
  }

  function successHandler(response) {
    return response.data;
  }

  function failureHandler(response) {
    console.error("error getting the os list");
  }

  return {
          getList: getList,
          post: post,
          put: put,
          delete: deletea
        };

});

app.factory('socket', function(){
  var url = location.origin + '/vm';
  var socket = io.connect(url);
  return socket;
});

app.controller('HomeController', function($scope, $mdSidenav, os, socket, $rootScope, $mdDialog, $mdToast){

  $scope.vmIsRunning = false;
  $scope.sessionsAvailable;
  $scope.osList;
  $scope.currentOs;
  os.getList().then(function(osList){
    $scope.osList = osList;
  });

  socket.on('available-sessions', function(data){
    $scope.sessionsAvailable = data.sessions;
    $scope.$apply();
  });

  socket.on('session-timer', function(data){
    $scope.timer = timerToString(data.timer);
  });

  socket.on('session-expired', function() {
    $mdToast.show(
      $mdToast.simple()
        .content('Session expired!')
        .position("right bottom")
        .hideDelay(2000)
    );
    $scope.vmIsRunning = false;
    $scope.title = "Select an OS";
  });

  $scope.toggleSidenav = function(menuId) {
    $mdSidenav(menuId).toggle();
  };

  $scope.title = "Select an OS";

  $scope.changeOS = function(os){
    $scope.title = os.title;
    $scope.currentOs = os;
    $scope.$broadcast("start-os-loading", os);
	}

  $scope.showInfo = function(){
    $mdDialog.show(
      $mdDialog.alert()
        .clickOutsideToClose(true)
        .title('Boot info')
        .content("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
        .ariaLabel($scope.currentOs.title + ' info')
        .ok('Got it!')
    );
  }

  $scope.$on("first-frame", function(event, data) {
    $scope.$broadcast('stop-os-loading');
    $scope.vmIsRunning = true;
    var canvas = document.getElementById("screen");
    canvas.focus();
  });

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

});

app.controller('VmController', function($scope, $timeout, $http, $interval, $rootScope, os, socket) {
  // Variables
  var mouseDown = 0;
  // Timer in seconds
  var timer = 600;
  var canvas = document.getElementById("screen");

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
      socket.on('machine-closed', restartVm);
    }

    function restartVm(){
      socket.emit('start', os);
      socket.removeListener("machine-closed", restartVm);
    }
  });

  canvas.addEventListener('keydown', function(e){
    if(e.keyCode == 8) {
     e.preventDefault();
    }
  });

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    handleMouse2Down(e);
  }, false);

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

  function handleMouse2Down(e){
    var pos = getMousePositionOnCanvas(e);
    socket.emit('mouse', {x: pos.x, y: pos.y, isDown: 2});
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

app.controller('AdminController', function($scope, $mdDialog, os){

  var url = location.origin + '/admin';
  var socket = io.connect(url);

  $scope.clients = [];

  os.getList().then(function(osList){
    $scope.osList = osList;
  });

  $scope.showModifyOsDialog = function(event, os){
    $scope.os = os;
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'partials/modify-os-form.jade',
      clickOutsideToClose:true,
      scope: $scope,
      preserveScope: true,
      targetEvent: event
    });

    function DialogController($scope, $mdDialog){
      $scope.cancel = function(){
        $mdDialog.hide();
      }

      $scope.confirm = function(os){
        $mdDialog.hide();
        $scope.modifyOs(os);
      }
    }
  }

  $scope.showNewOsDialog = function(event){
    $mdDialog.show({
      controller: DialogController,
      templateUrl: 'partials/new_os.jade',
      clickOutsideToClose:true,
      scope: $scope,
      preserveScope: true,
      targetEvent: event
    });

    function DialogController($scope, $mdDialog){
      $scope.cancel = function(){
        $mdDialog.hide();
      }

      $scope.confirm = function(os){
        $mdDialog.hide();
        $scope.addOs(os);
      }
    }
  }

  $scope.addOs = function(newOs){
    os.post(newOs).then(function() {
      $scope.osList.push(newOs);
    });
  }

  $scope.modifyOs = function(modOs){
    os.put(modOs);
  }

  $scope.deleteOs = function(delOs){
    os.delete(delOs).then(function() {
      $scope.osList.splice($scope.osList.indexOf(delOs), 1);
      $scope.$apply();
    });
  }

  $scope.noSessionsRunning = function(){
    if($scope.clients.length == 0){
      return true;
    } else {
      return false;
    }
  }

  socket.on('available-sessions', function(data){
    $scope.sessions = data.sessions;
    $scope.$apply();
  });

  socket.on('clients', function(clients) {
    $scope.clients = clients;
    $scope.$apply();
  });

  socket.on('new-client', function(client) {
    $scope.clients.push(client);
    $scope.$apply();
  });

  socket.on('remove-client', function(client) {
    $scope.clients.splice($scope.clients.indexOf(client), 1);
    $scope.$apply();
  });

});
