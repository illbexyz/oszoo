module.exports = ($scope, $rootScope, os, socket, keysyms) ->
  xMov = 0
  yMov = 0
  # Variables
  mouseDown = 0
  # Timer in seconds
  timer = 600
  # Canvas
  canvas = document.getElementById('screen')

  canvas.requestPointerLock = canvas.requestPointerLock or
                            canvas.mozRequestPointerLock or
                            canvas.webkitRequestPointerLock

  document.exitPointerLock = document.exitPointerLock or
         document.mozExitPointerLock or
         document.webkitExitPointerLock;

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
    if xMov > 800
      xMov = 800

    yMov += movementY
    if yMov < 0
      yMov = 0
    if yMov > 600
      yMov = 600

    socket.emit 'mouse',
      x: xMov
      y: yMov
      isDown: mouseDown

  handleMouseDown = (e) ->
    socket.emit 'mouse',
      x: xMov
      y: yMov
      isDown: 1
    return

  handleMouse2Down = (e) ->
    e.preventDefault()
    console.log xMov, yMov
    socket.emit 'mouse',
      x: xMov
      y: yMov
      isDown: 2
    return

  handleMouseUp = (e) ->
    socket.emit 'mouse',
      x: xMov
      y: yMov
      isDown: 0
    return

  handleKeydown = (event) ->
    if event.keyCode == 8
      event.preventDefault()
    socket.emit 'keydown',
      key: keysyms(event.keyCode)
      keydown: 1
    return

  handleKeyup = (event) ->
    if event.keyCode == 8
      event.preventDefault()
    socket.emit 'keydown',
      key: keysyms(event.keyCode)
      keydown: 0
    return

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

  canvas.onclick = (event) ->
    if xMov == 0 and yMov == 0
      xMov = event.x or event.clientX
      yMov = event.y or event.clientY
    canvas.requestPointerLock()

  document.addEventListener('pointerlockchange', lockChangeAlert, false)
  document.addEventListener('mozpointerlockchange', lockChangeAlert, false)
  document.addEventListener('webkitpointerlockchange', lockChangeAlert, false)

  $scope.vmIsRunning = false
  # String timer
  $scope.timer = '10:00'

  document.body.onmousedown = ->
    mouseDown = 1
    return

  document.body.onmouseup = ->
    mouseDown = 0
    return

  canvas.tabIndex = 1000
  ctx = canvas.getContext('2d')

  socket.on 'init', (data) ->
    canvas.width = data.width
    canvas.height = data.height
    $scope.vmIsRunning = true
    return

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
    image.src = 'data:image/jpeg;base64,' + base64

    image.onload = ->
      ctx.drawImage image, data.x, data.y, data.width, data.height
      $rootScope.$broadcast 'first-frame'
      return

    return

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

  $scope.$on 'start-os-loading', (event, os) ->

    restartVm = ->
      socket.emit 'start', os
      socket.removeListener 'machine-closed', restartVm
      return

    if !$scope.vmIsRunning
      socket.emit 'start', os
    else
      socket.emit 'stop'
      socket.on 'machine-closed', restartVm
    return

  $scope.$on 'stop-vm', (event) ->
    $scope.stopMachine()

  $scope.stopMachine = ->
    socket.emit 'stop'
    $scope.vmIsRunning = false
    return

  $scope.$on '$destroy', ->
    socket.emit 'close'
    return
  return