module.exports = ($scope, $rootScope, os, socket, keysyms) ->
  xMov = 0
  yMov = 0
  # Variables
  mouseDown = 0
  # Timer in seconds
  timer = 600
  # Canvas
  canvas = document.getElementById('screen')

  $scope.vmIsRunning = false
  # String timer
  $scope.timer = '10:00'

  canvas.requestPointerLock = canvas.requestPointerLock or
                            canvas.mozRequestPointerLock or
                            canvas.webkitRequestPointerLock

  document.exitPointerLock = document.exitPointerLock or
         document.mozExitPointerLock or
         document.webkitExitPointerLock;

  canvas.tabIndex = 1000
  ctx = canvas.getContext('2d')

  lockChangeAlert = () ->
    if document.pointerLockElement == canvas or
    document.mozPointerLockElement == canvas or
    document.webkitPointerLockElement == canvas
      document.addEventListener "mousemove", handleMouseMove, false
      document.addEventListener 'keydown', handleKeydown, false
      document.addEventListener "keyup", handleKeyup, false
      document.addEventListener 'mousedown', handleMouseDown, false
      document.addEventListener 'mouseup', handleMouseUp, false
      document.addEventListener 'contextmenu', handleMouse2Down, false
    else
      document.removeEventListener "mousemove", handleMouseMove, false
      document.removeEventListener 'keydown', handleKeydown, false
      document.removeEventListener 'keyup', handleKeyup, false
      document.removeEventListener 'mousedown', handleMouseDown, false
      document.removeEventListener 'mouseup', handleMouseUp, false
      document.removeEventListener 'contextmenu', handleMouse2Down, false

  document.addEventListener('pointerlockchange', lockChangeAlert, false)
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false)
  document.addEventListener('webkitpointerlockchange', lockChangeAlert, false)

  handleMouseMove = (e) ->
    movementX = e.movementX or
        e.mozMovementX      or
        e.webkitMovementX   or
        0

    movementY = e.movementY or
        e.mozMovementY      or
        e.webkitMovementY   or
        0

    xMov += movementX
    if xMov < 0
      xMov = 0
    if xMov > canvas.width
      xMov = canvas.width

    yMov += movementY
    if yMov < 0
      yMov = 0
    if yMov > canvas.height
      yMov = canvas.height

    sendMouse()

  handleMouseDown = (e) ->
    sendMouse()

  handleMouse2Down = (e) ->
    e.preventDefault()
    sendMouse()

  handleMouseUp = (e) ->
    sendMouse()

  handleKeydown = (event) ->
    if event.keyCode == 8
      event.preventDefault()
    socket.emit 'keydown',
      key: keysyms(event.keyCode)
      keydown: 1

  handleKeyup = (event) ->
    if event.keyCode == 8
      event.preventDefault()
    socket.emit 'keydown',
      key: keysyms(event.keyCode)
      keydown: 0

  canvas.onclick = (event) ->
    if xMov == 0 and yMov == 0
      xMov = canvas.width/2
      yMov = canvas.height/2
    canvas.requestPointerLock()

  document.body.onmousedown = ->
    mouseDown = 1

  document.body.onmouseup = ->
    mouseDown = 0

  resizeCanvas = (width, height) ->
    if width == 640 and height == 480 or
    width == 800 and height == 600 or
    width == 1024 and height == 768 or
    width == 1280 and height == 720
      canvas.width = width
      canvas.height = height

  isCapslock = (e) ->
    e = if e then e else window.event
    charCode = false
    if e.which
      charCode = e.which
    else if e.keyCode
      charCode = e.keyCode
    shifton = false
    if e.shiftKey
      shifton = e.shiftKey
    else if e.modifiers
      shifton = ! !(e.modifiers & 4)
    if charCode >= 97 and charCode <= 122 and shifton
      return false
    if charCode >= 65 and charCode <= 90 and shifton
      return true
    false

  #----------------------------------------------------------------------------#
  #-------------------------- Websocket messaging -----------------------------#
  #----------------------------------------------------------------------------#

  socket.on 'init', (data) ->
    canvas.width = data.width
    canvas.height = data.height
    $scope.vmIsRunning = true

  socket.on 'frame', (data) ->
    image = new Image
    blob = new Blob([ data.image ], type: 'image/jpeg')
    urlBlob = URL.createObjectURL(blob)
    uInt8Array = new Uint8Array(data.image)
    i = uInt8Array.length
    binaryString = [ i ]
    scale = 1
    while i--
      binaryString[i] = String.fromCharCode(uInt8Array[i])
    bdata = binaryString.join('')
    base64 = window.btoa(bdata)
    resizeCanvas(data.width, data.height)
    image.src = 'data:image/jpeg;base64,' + base64

    image.onload = ->
      ctx.drawImage image, data.x, data.y, data.width, data.height
      $rootScope.$broadcast 'first-frame'

  sendMouse = (x, y, isDown) ->
    socket.emit 'mouse',
      x: xMov
      y: yMov
      isDown: isDown

  #----------------------------------------------------------------------------#
  #---------------------------- Angular messaging -----------------------------#
  #----------------------------------------------------------------------------#

  $scope.$on 'start-os-loading', (event, os) ->

    restartVm = ->
      socket.emit 'start', os
      socket.removeListener 'machine-closed', restartVm

    if !$scope.vmIsRunning
      socket.emit 'start', os
    else
      socket.emit 'stop'
      socket.on 'machine-closed', restartVm

  $scope.$on 'stop-vm', (event) ->
    $scope.stopMachine()

  $scope.stopMachine = ->
    socket.emit 'stop'
    $scope.vmIsRunning = false
    return

  $scope.$on '$destroy', ->
    socket.emit 'close'
    