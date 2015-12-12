//----------------------------------------------------------------------------//
//-------------------------- Homepage controller -----------------------------//
//----------------------------------------------------------------------------//

module.exports = function($scope, $mdDialog, $mdToast, $mdSidenav, os, socket) {
  $scope.title = 'Select an OS';
  $scope.vmIsRunning = false;
  $scope.sessionsAvailable;
  $scope.osList;
  $scope.currentOs;

  os.getList().then((osList) => {
    $scope.osList = osList;
  });

  socket.on('available-sessions', (data) => {
    $scope.sessionsAvailable = data.sessions;
    $scope.$apply();
  });

  socket.on('session-timer', (data) => {
    // TODO: timer directive
    const timerToString = (timer) => {
      let minutes = `${Math.floor(timer / 60)}`;
      let seconds = `${timer % 60}`;
      if(minutes.length == 1) minutes = `0${minutes}`;
      if(seconds.length == 1) seconds = `0${seconds}`;
      return `${minutes}:${seconds}`;
    };

    $scope.timer = timerToString(data.timer);
  });

  socket.on('session-expired', () => {
    $mdToast.show($mdToast.simple()
      .content('Session expired!')
      .position('right bottom')
      .hideDelay(2000));
    $scope.stopVm();
  });

  $scope.toggleSidenav = (menuId) => {
    $mdSidenav(menuId).toggle();
  };

  $scope.changeOS = (os) => {
    $scope.title = os.title;
    $scope.currentOs = os;
    $scope.$broadcast('start-os-loading');
  };

  $scope.showInfo = () => {
    $mdDialog.show($mdDialog.alert()
      .clickOutsideToClose(true)
      .title('Boot info')
      .content($scope.currentOs.description)
      .ariaLabel($scope.currentOs.title + ' info')
      .ok('Close'));
  };

  $scope.stopVm = () => {
    $scope.vmIsRunning = false;
    $scope.title = 'Select an OS';
    $scope.$broadcast('stop-vm');
  };

  $scope.$on('first-frame', (event, data) => {
    $scope.$broadcast('stop-os-loading');
    $scope.vmIsRunning = true;
    const canvas = document.getElementById('screen');
    canvas.focus();
  });
};