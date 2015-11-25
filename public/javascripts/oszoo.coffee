#------------------------------------------------------------------------------#
#-------------------------- Module configuration ------------------------------#
#------------------------------------------------------------------------------#

app = angular.module('OSZoo', [
  'ngMaterial'
  'ngAnimate'
  'ngRoute'
])

app.config ($mdThemingProvider) ->
  $mdThemingProvider.theme('default').primaryPalette('indigo').accentPalette 'green'
  #$locationProvider.html5Mode(true);
  return

#------------------------------------------------------------------------------#
#----------------------------- Os Service -------------------------------------#
#------------------------------------------------------------------------------#

app.service 'os', ($http) ->
  url = '/api/os'

  getList = ->
    request = $http.get(url)
    request.then successHandler, failureHandler

  post = (os) ->
    request = $http.post(url, os)
    request.then successHandler, failureHandler

  put = (os) ->
    request = $http.put(url, os)
    request.then successHandler, failureHandler

  deletea = (os) ->
    deleteUrl = url + '/' + os.id
    request = $http.delete(deleteUrl)
    request.then successHandler, failureHandler

  successHandler = (response) ->
    return response.data

  failureHandler = (response) ->
    console.error 'error getting the os list'
    return

  return {
    getList: getList
    post: post
    put: put
    delete: deletea
  }

#------------------------------------------------------------------------------#
#--------------------------- Socket.io Factory --------------------------------#
#------------------------------------------------------------------------------#

app.factory 'socket', ->
  url = location.origin + '/vm'
  socket = io.connect(url)
  return socket

#------------------------------------------------------------------------------#
#--------------------------- Homepage controller ------------------------------#
#------------------------------------------------------------------------------#

app.controller 'HomeController', ($scope, $mdSidenav, os, socket, $rootScope, $mdDialog, $mdToast) ->

  $scope.title = 'Select an OS'
  $scope.vmIsRunning = false
  $scope.sessionsAvailable
  $scope.osList
  $scope.currentOs

  os.getList().then (osList) ->
    $scope.osList = osList
    return

  socket.on 'available-sessions', (data) ->
    $scope.sessionsAvailable = data.sessions
    $scope.$apply()

  socket.on 'session-timer', (data) ->
    # TODO: timer directive
    timerToString = (timer) ->
      minutes = '' + Math.floor(timer / 60)
      seconds = '' + timer % 60
      if minutes.length == 1
        minutes = '0' + minutes
      if seconds.length == 1
        seconds = '0' + seconds
      minutes + ':' + seconds
    $scope.timer = timerToString(data.timer)

  socket.on 'session-expired', ->
    $mdToast.show $mdToast.simple().content('Session expired!').position('right bottom').hideDelay(2000)
    $scope.stopVm()

  $scope.toggleSidenav = (menuId) ->
    $mdSidenav(menuId).toggle()

  $scope.changeOS = (os) ->
    $scope.title = os.title
    $scope.currentOs = os
    $scope.$broadcast 'start-os-loading', os
    return

  $scope.showInfo = ->
    $mdDialog.show $mdDialog.alert().
      clickOutsideToClose(true).
      title('Boot info').
      content($scope.currentOs.description).
      ariaLabel($scope.currentOs.title + ' info').
      ok('Close')
    return

  $scope.stopVm = ->
    $scope.vmIsRunning = false
    $scope.title = 'Select an OS'
    $scope.$broadcast 'stop-vm'

  $scope.$on 'first-frame', (event, data) ->
    $scope.$broadcast 'stop-os-loading'
    $scope.vmIsRunning = true
    canvas = document.getElementById('screen')
    canvas.focus()
    return
  return

app.controller 'VmController', ($scope, $timeout, $http, $interval, $rootScope, os, socket) ->
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
      key: codeConverter.convert(event.keyCode)
      keydown: 1
    return

  handleKeyup = (event) ->
    if event.keyCode == 8
      event.preventDefault()
    socket.emit 'keydown',
      key: codeConverter.convert(event.keyCode)
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

  # Keycode converter
  codeConverter = new KeysymsCodeConverter()
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

#------------------------------------------------------------------------------#
#--------------------- Interactive console controller -------------------------#
#------------------------------------------------------------------------------#

app.controller 'ConsoleController', ($scope, $http, $interval, $rootScope) ->

  runLoading = ->
    $interval loadingAnimation, 80
    return

  stopLoading = ->
    $interval.cancel loadingAnimation
    return

  runInputHint = ->
    $interval (->
      if $scope.userInput == ''
        $scope.userInput = '_'
      else if $scope.userInput == '_'
        $scope.userInput = ''
      return
    ), 1000

  loadingAnimation = ->
    switch $scope.loadingSymbol
      when '|'
        $scope.loadingSymbol = '/'
      when '/'
        $scope.loadingSymbol = '-'
      when '-'
        $scope.loadingSymbol = '\\'
      when '\\'
        $scope.loadingSymbol = '|'
    return

  command = ->
    input = document.getElementById('consoleInput')
    spanReplace = document.createElement('span')
    spanReplace.appendChild document.createTextNode(input.value)
    consoleElement.appendChild spanReplace
    switch $scope.userInput
      when 'oslist'
        printOsList()
      when 'doge'
        print 'Such command, very useful, wow.'
      else
        osToLaunch = null
        for key of $scope.osList
          `key = key`
          if $scope.userInput == $scope.osList[key].consoleTitle
            osToLaunch = $scope.osList[key]
        if osToLaunch
          $rootScope.$broadcast 'start-os-loading', osToLaunch
          print 'Wait for the magic to happen...'
        else
          p = document.createElement('p')
          p.appendChild document.createTextNode('Sorry, I can\'t help you with that.')
          consoleElement.appendChild p
        break
    $scope.userInput = ''
    span = document.createElement('span')
    span.appendChild document.createTextNode('user:~ ')
    consoleElement.appendChild span
    consoleElement.appendChild input
    input.focus()
    return

  print = (string) ->
    p = document.createElement('p')
    p.appendChild document.createTextNode(string)
    consoleElement.appendChild p
    return

  printOsList = ->
    p = document.createElement('p')
    table = document.createElement('table')
    table.setAttribute 'class', 'consoleHighlight'
    tr = document.createElement('tr')
    for key of $scope.osList
      `key = key`
      td = document.createElement('td')
      td.appendChild document.createTextNode($scope.osList[key].consoleTitle)
      tr.appendChild td
    table.appendChild tr
    p.appendChild table
    consoleElement.appendChild p
    return

  $scope.userInput = ''
  $scope.loadingSymbol = '|'
  $http.get('/api/os').then (response) ->
    $scope.osList = response.data
    return
  consoleElement = document.getElementById('consoleBody')
  intervalPromise = runInputHint()
  $scope.$on 'start-os-loading', (event, os) ->
    $scope.isLoading = true
    runLoading()
    return
  $scope.$on 'stop-os-loading', (event, data) ->
    $scope.isLoading = false
    stopLoading()
    return

  $scope.enterPress = ->
    command()
    return

  $scope.setFocus = ->
    document.getElementById('consoleInput').focus()
    return

  document.getElementById('consoleInput').onfocus = ->
    if $scope.userInput == '_'
      $scope.userInput = ''
    $interval.cancel intervalPromise
    return

  document.getElementById('consoleInput').onblur = ->
    if $scope.userInput == ''
      intervalPromise = runInputHint()
    return

  return

#------------------------------------------------------------------------------#
#------------------------- Enter Press directive ------------------------------#
#------------------------------------------------------------------------------#

app.directive 'enterPress', ->
  (scope, element, attrs) ->
    element.bind 'keydown keypress', (event) ->
      if event.which == 13
        scope.$apply ->
          scope.$eval attrs.enterPress
          return
        event.preventDefault()
      return
    return

#------------------------------------------------------------------------------#
#------------------------- Admin page controller ------------------------------#
#------------------------------------------------------------------------------#

app.controller 'AdminController', ($scope, $mdDialog, os) ->
  url = location.origin + '/admin'
  socket = io.connect(url)
  $scope.clients = []
  os.getList().then (osList) ->
    $scope.osList = osList
    return

  $scope.showModifyOsDialog = (event, os) ->

    DialogController = ($scope, $mdDialog) ->

      $scope.cancel = ->
        $mdDialog.hide()
        return

      $scope.confirm = (os) ->
        if $scope.modifyOsForm.$valid
          $scope.modifyOs os
          $mdDialog.hide()
        return

      return

    $scope.os = os
    $mdDialog.show
      controller: DialogController
      templateUrl: 'partials/modify-os-form.jade'
      clickOutsideToClose: true
      scope: $scope
      preserveScope: true
      targetEvent: event
    return

  $scope.showNewOsDialog = (event) ->

    DialogController = ($scope, $mdDialog) ->

      $scope.cancel = ->
        $mdDialog.hide()
        return

      $scope.confirm = (os) ->
        $mdDialog.hide()
        $scope.addOs os
        return

      return

    $mdDialog.show
      controller: DialogController
      templateUrl: 'partials/new_os.jade'
      clickOutsideToClose: true
      scope: $scope
      preserveScope: true
      targetEvent: event
    return

  $scope.addOs = (newOs) ->
    os.post(newOs)
    $scope.osList.push newOs
    return

  $scope.modifyOs = (modOs) ->
    os.put(modOs)
    return

  $scope.deleteOs = (delOs) ->
    os.delete(delOs)
    $scope.osList.splice $scope.osList.indexOf(delOs), 1
    return

  $scope.noSessionsRunning = ->
    return $scope.clients.length == 0

  socket.on 'available-sessions', (data) ->
    $scope.sessions = data.sessions
    $scope.$apply()
    return
  socket.on 'clients', (clients) ->
    $scope.clients = clients
    $scope.$apply()
    return
  socket.on 'new-client', (client) ->
    $scope.clients.push client
    $scope.$apply()
    return
  socket.on 'remove-client', (client) ->
    $scope.clients.splice $scope.clients.indexOf(client), 1
    $scope.$apply()
    return
  return
