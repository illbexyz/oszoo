app = angular.module('OSZoo', [
  'ngMaterial'
  'ngAnimate'
  'ngRoute'
])
app.config ($mdThemingProvider) ->
  $mdThemingProvider.theme('default').primaryPalette('indigo').accentPalette 'green'
  #$locationProvider.html5Mode(true);
  return
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
    response.data

  failureHandler = (response) ->
    console.error 'error getting the os list'
    return

  {
    getList: getList
    post: post
    put: put
    delete: deletea
  }
app.factory 'socket', ->
  url = location.origin + '/vm'
  socket = io.connect(url)
  socket
app.controller 'HomeController', ($scope, $mdSidenav, os, socket, $rootScope, $mdDialog, $mdToast) ->

  timerToString = (timer) ->
    minutes = '' + Math.floor(timer / 60)
    seconds = '' + timer % 60
    if minutes.length == 1
      minutes = '0' + minutes
    if seconds.length == 1
      seconds = '0' + seconds
    minutes + ':' + seconds

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
    return
  socket.on 'session-timer', (data) ->
    $scope.timer = timerToString(data.timer)
    return
  socket.on 'session-expired', ->
    $mdToast.show $mdToast.simple().content('Session expired!').position('right bottom').hideDelay(2000)
    $scope.vmIsRunning = false
    $scope.title = 'Select an OS'
    return

  $scope.toggleSidenav = (menuId) ->
    $mdSidenav(menuId).toggle()
    return

  $scope.title = 'Select an OS'

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

  $scope.$on 'first-frame', (event, data) ->
    $scope.$broadcast 'stop-os-loading'
    $scope.vmIsRunning = true
    canvas = document.getElementById('screen')
    canvas.focus()
    return
  return


app.controller 'VmController', ($scope, $timeout, $http, $interval, $rootScope, os, socket) ->
  # Variables
  mouseDown = 0
  # Timer in seconds
  timer = 600
  # Canvas
  canvas = document.getElementById('screen')
  # Keycode converter
  codeConverter = new KeysymsCodeConverter()
  console.log codeConverter

  initializeSocket = ->
    `var canvas`
    canvas = document.getElementById('screen')
    canvas.tabIndex = 1000
    ctx = canvas.getContext('2d')
    socket.on 'init', (data) ->
      canvas.width = data.width
      canvas.height = data.height
      canvas.addEventListener 'keydown', handleKeydown
      canvas.addEventListener 'mousedown', handleMouseDown
      canvas.addEventListener 'mouseup', handleMouseUp
      canvas.addEventListener 'mousemove', handleMouseMove
      $scope.vmIsRunning = true
      return
    socket.on 'frame', (data) ->
      image = new Image
      blob = new Blob([ data.image ], type: 'image/jpeg')
      urlBlob = URL.createObjectURL(blob)
      uInt8Array = new Uint8Array(data.image)
      i = uInt8Array.length
      binaryString = [ i ]
      while i--
        binaryString[i] = String.fromCharCode(uInt8Array[i])
      bdata = binaryString.join('')
      base64 = window.btoa(bdata)
      if data.width == 640 and data.height == 480
        canvas.width = 640
        canvas.height = 480
      image.src = 'data:image/jpeg;base64,' + base64

      image.onload = ->
        ctx.drawImage image, data.x, data.y, data.width, data.height
        $rootScope.$broadcast 'first-frame'
        return

      return
    return

  handleMouseMove = (e) ->
    pos = getMousePositionOnCanvas(e)
    socket.emit 'mouse',
      x: pos.x
      y: pos.y
      isDown: mouseDown
    return

  handleMouseDown = (e) ->
    pos = getMousePositionOnCanvas(e)
    socket.emit 'mouse',
      x: pos.x
      y: pos.y
      isDown: 1
    return

  handleMouse2Down = (e) ->
    pos = getMousePositionOnCanvas(e)
    socket.emit 'mouse',
      x: pos.x
      y: pos.y
      isDown: 2
    return

  handleMouseUp = (e) ->
    pos = getMousePositionOnCanvas(e)
    socket.emit 'mouse',
      x: pos.x
      y: pos.y
      isDown: 0
    return

  getMousePositionOnCanvas = (e) ->
    mouseX = undefined
    mouseY = undefined
    if e.offsetX
      mouseX = e.offsetX
      mouseY = e.offsetY
    else if e.layerX
      mouseX = e.layerX
      mouseY = e.layerY
    {
      x: mouseX
      y: mouseY
    }

  handleKeydown = (event) ->
    if event.keyCode == 8
      event.preventDefault()
    socket.emit 'keydown', key: codeConverter.convert(event.keyCode)
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

  $scope.vmIsRunning = false
  # String timer
  $scope.timer = '10:00'
  # Initialize the socket
  #initializeTimer();
  initializeSocket()
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
  canvas.addEventListener 'keydown', (e) ->
    if e.keyCode == 8
      e.preventDefault()
    return
  canvas.addEventListener 'contextmenu', ((e) ->
    e.preventDefault()
    handleMouse2Down e
    return
  ), false

  document.body.onmousedown = ->
    mouseDown = 1
    return

  document.body.onmouseup = ->
    mouseDown = 0
    return

  $scope.stopMachine = ->
    socket.emit 'stop'
    return

  $scope.$on '$destroy', ->
    canvas.removeEventListener 'mousemove', handleMouseMove
    canvas.removeEventListener 'keydown', handleKeydown
    canvas.removeEventListener 'mousedown', handleMouseDown
    canvas.removeEventListener 'mouseup', handleMouseUp
    socket.emit 'close'
    return
  return
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
        $mdDialog.hide()
        $scope.modifyOs os
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
    os.post(newOs).then ->
      $scope.osList.push newOs
      return
    return

  $scope.modifyOs = (modOs) ->
    os.put modOs
    return

  $scope.deleteOs = (delOs) ->
    os.delete(delOs).then ->
      $scope.osList.splice $scope.osList.indexOf(delOs), 1
      $scope.$apply()
      return
    return

  $scope.noSessionsRunning = ->
    if $scope.clients.length == 0
      true
    else
      false

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

# ---
# generated by js2coffee 2.1.0
