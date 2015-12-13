module.exports = function($scope, $rootScope, os, socket, keysyms){
  const vmSocket = socket('vm');

  let xMov = 0;
  let yMov = 0;
  // Canvas
  let canvas = document.getElementById('screen');


  // String timer
  $scope.timer = '10:00';

  canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;

  document.exitPointerLock = document.exitPointerLock ||
         document.mozExitPointerLock ||
         document.webkitExitPointerLock;

  canvas.tabIndex = 1000;
  const ctx = canvas.getContext('2d');

  function lockChangeAlert() {
    if (document.pointerLockElement == canvas ||
        document.mozPointerLockElement == canvas ||
        document.webkitPointerLockElement == canvas) {
      document.addEventListener('mousemove', handleMouseMove, false);
      document.addEventListener('keydown', handleKeydown, false);
      document.addEventListener('keyup', handleKeyup, false);
      document.addEventListener('mousedown', handleMouseDown, false);
      document.addEventListener('mouseup', handleMouseUp, false);
      document.addEventListener('contextmenu', handleMouse2Down, false);
    } else {
      document.removeEventListener('mousemove', handleMouseMove, false);
      document.removeEventListener('keydown', handleKeydown, false);
      document.removeEventListener('keyup', handleKeyup, false);
      document.removeEventListener('mousedown', handleMouseDown, false);
      document.removeEventListener('mouseup', handleMouseUp, false);
      document.removeEventListener('contextmenu', handleMouse2Down, false);
    }
  }

  document.addEventListener('pointerlockchange', lockChangeAlert, false);
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
  document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

  function handleMouseMove(e) {
    let movementX = e.movementX
        || e.mozMovementX
        || e.webkitMovementX
        || 0;

    let movementY = e.movementY
        || e.mozMovementY
        || e.webkitMovementY
        || 0;

    xMov += movementX;
    if(xMov < 0) xMov = 0;
    if(xMov > canvas.width) xMov = canvas.width;

    yMov += movementY;
    if(yMov < 0) yMov = 0;
    if(yMov > canvas.height) yMov = canvas.height;

    sendMouse();
  }

  function handleMouseDown(e) {
    sendMouse();
  }

  function handleMouse2Down(e) {
    e.preventDefault();
    sendMouse();
  }

  function handleMouseUp(e) {
    sendMouse();
  }

  function handleKeydown(e) {
    if(e.keyCode == 8 || e.keyCode == 37 
      || e.keyCode == 38 || e.keyCode == 39
      || e.keyCode == 40) {
      e.preventDefault();
    }
    vmSocket.emit('keydown', {
      key: keysyms(e.keyCode),
      keydown: 1
    });
  }

  function handleKeyup(e){
    if(e.keyCode == 8 || e.keyCode == 37 
      || e.keyCode == 38 || e.keyCode == 39
      || e.keyCode == 40) {
      e.preventDefault();
    }
    vmSocket.emit('keydown', {
      key: keysyms(e.keyCode),
      keydown: 0
    });
  }

  canvas.onclick = function(event) {
    // Set the pointer at the middle of the screen
    if(xMov == 0 && yMov == 0) {
      xMov = canvas.width / 2;
      yMov = canvas.height / 2;
    }
    canvas.requestPointerLock();
  };

  function resizeCanvas(width, height) {
    if(width == 640 && height == 480
      || width == 800 && height == 600
      || width == 1024 && height == 768
      || width == 1280 && height == 720) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  //--------------------------------------------------------------------------//
  //------------------------- Websocket messaging ----------------------------//
  //--------------------------------------------------------------------------//

  vmSocket.on('init', (data) => {
    canvas.width = data.width;
    canvas.height = data.height;
  });

  vmSocket.on('frame', (data) => {
    const image = new Image();
    const uInt8Array = new Uint8Array(data.image);
    let i = uInt8Array.length;
    let binaryString = [i];
    while(i--) {
      binaryString[i] = String.fromCharCode(uInt8Array[i]);
    }
    let bdata = binaryString.join('');
    let base64 = window.btoa(bdata);
    resizeCanvas(data.width, data.height);
    image.src = 'data:image/jpeg;base64,' + base64;

    image.onload = () => {
      ctx.drawImage(image, data.x, data.y, data.width, data.height);
      $rootScope.$broadcast('first-frame');
    };
  });

  function sendMouse(x, y, isDown) {
    vmSocket.emit('mouse', {
      x: xMov,
      y: yMov,
      isDown: isDown
    });
  }

};