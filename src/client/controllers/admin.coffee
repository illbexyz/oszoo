#------------------------------------------------------------------------------#
#------------------------- Admin page controller ------------------------------#
#------------------------------------------------------------------------------#

module.exports = ($scope, $mdDialog, os) ->
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