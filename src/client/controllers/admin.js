//----------------------------------------------------------------------------//
//------------------------ Admin page controller -----------------------------//
//----------------------------------------------------------------------------//

module.exports = function($scope, $mdDialog, os, socket) {
  const adminSocket = socket('admin');
  $scope.clients = [];

  os.getList().then((osList) => {
    $scope.osList = osList;
  });

  $scope.showModifyOsDialog = (event, os) => {

    const DialogController = function($scope, $mdDialog) {

      $scope.cancel = () => {
        $mdDialog.hide();
      };

      $scope.confirm = (os) => {
        if($scope.modifyOsForm.$valid) {
          $scope.modifyOs(os);
          $mdDialog.hide();
        }
      };

    };

    $scope.os = os;
    $mdDialog.show({
      controller: ['$scope', '$mdDialog', DialogController],
      templateUrl: 'partials/modify-os-form.jade',
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      targetEvent: event
    });
  };

  $scope.showNewOsDialog = (event) => {

    const DialogController = function($scope, $mdDialog) {

      $scope.cancel = () => {
        $mdDialog.hide();
      };

      $scope.confirm = (os) => {
        $mdDialog.hide();
        $scope.addOs(os);
      };

    };

    $mdDialog.show({
      controller: ['$scope', '$mdDialog', DialogController],
      templateUrl: 'partials/new_os.jade',
      clickOutsideToClose: true,
      scope: $scope,
      preserveScope: true,
      targetEvent: event
    });
  };

  $scope.addOs = (newOs) => {
    os.post(newOs);
    $scope.osList.push(newOs);
  };

  $scope.modifyOs = (modOs) => {
    os.put(modOs);
  };

  $scope.deleteOs = (delOs) => {
    os.delete(delOs);
    $scope.osList.splice($scope.osList.indexOf(delOs), 1);
  };

  $scope.noSessionsRunning = () => {
    return $scope.clients.length == 0;
  };

  adminSocket.on('available-sessions', (data) => {
    $scope.sessions = data.sessions;
    $scope.$apply();
  });

  adminSocket.on('clients', (data) => {
    $scope.clients = data.clients;
    $scope.$apply();
  });

  adminSocket.on('new-client', (client) => {
    $scope.clients.push(client);
    $scope.$apply();
  });

  adminSocket.on('remove-client', (client) => {
    $scope.clients.splice($scope.clients.indexOf(client), 1);
    $scope.$apply();
  });

};