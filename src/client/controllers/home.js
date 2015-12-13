//----------------------------------------------------------------------------//
//-------------------------- Homepage controller -----------------------------//
//----------------------------------------------------------------------------//

module.exports = function($scope, $mdDialog, $mdToast, $mdSidenav, os, socket, vm) {
  const WatchJS = require('watchjs');
  const watch = WatchJS.watch;

  const homeSocket = socket('vm');

  $scope.title = 'Select an OS';
  $scope.sessionsAvailable;
  $scope.osList;
  $scope.currentOs;

  watch(vm, 'running', () => {
    $scope.vmIsRunning = vm.running;
  });

  os.getList().then((osList) => {
    $scope.osList = osList;
  });

  homeSocket.on('available-sessions', (data) => {
    $scope.sessionsAvailable = data.sessions;
    $scope.$apply();
  });

  homeSocket.on('session-timer', (data) => {
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

  homeSocket.on('session-expired', () => {
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
    vm.start(os, () => {
      $scope.$broadcast('console-stop-loading');
      const canvas = document.getElementById('screen');
      canvas.focus();
    });
    $scope.$broadcast('console-start-loading');
  };

  $scope.stopVm = () => {
    $scope.title = 'Select an OS';
    vm.stop();
  };

  $scope.showInfo = () => {
    $mdDialog.show($mdDialog.alert()
      .clickOutsideToClose(true)
      .title('Boot info')
      .content($scope.currentOs.description)
      .ariaLabel($scope.currentOs.title + ' info')
      .ok('Close'));
  };

};