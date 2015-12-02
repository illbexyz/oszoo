#------------------------------------------------------------------------------#
#--------------------- Interactive console controller -------------------------#
#------------------------------------------------------------------------------#
#
module.exports = ($scope, $http, $interval, $rootScope) ->

  runLoading = ->
    $scope.loadingInterval = $interval loadingAnimation, 80
    return

  stopLoading = ->
    $interval.cancel $scope.loadingInterval
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
          if $scope.userInput == $scope.osList[key].consoleTitle
            osToLaunch = $scope.osList[key]
        if osToLaunch
          $rootScope.$broadcast 'start-os-loading', osToLaunch
          print 'Wait for the magic to happen...'
        else
          p = document.createElement('p')
          node = document.createTextNode("Sorry, I can't help you with that.")
          p.appendChild node
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