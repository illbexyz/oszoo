//----------------------------------------------------------------------------//
//-------------------- Interactive console controller ------------------------//
//----------------------------------------------------------------------------//

module.exports = function($scope, $http, $interval, $rootScope) {

  $scope.userInput = '';
  $scope.loadingSymbol = '|';

  const consoleElement = document.getElementById('consoleBody');
  let intervalPromise = runInputHint();

  function runLoading() {
    $scope.loadingInterval = $interval(loadingAnimation, 80);
  }

  function stopLoading() {
    $interval.cancel($scope.loadingInterval);
  }

  function runInputHint() {
    $interval(() => {
      if($scope.userInput == '') {
        $scope.userInput = '_';
      } else if($scope.userInput == '_') {
        $scope.userInput = '';
      }
    }, 1000);
  }

  function loadingAnimation() {
    switch($scope.loadingSymbol) {
    case '|':
      $scope.loadingSymbol = '/';
      break;
    case '/':
      $scope.loadingSymbol = '-';
      break;
    case '-':
      $scope.loadingSymbol = '\\';
      break;
    case '\\':
      $scope.loadingSymbol = '|';
      break;
    }
  }

  function command() {
    const input = document.getElementById('consoleInput');
    const spanReplace = document.createElement('span');
    spanReplace.appendChild(document.createTextNode(input.value));
    consoleElement.appendChild(spanReplace);
    switch($scope.userInput) {
    case 'oslist':
      printOsList();
      break;
    case 'doge':
      print('Such command, very useful, wow.');
      break;
    default:
      let osToLaunch = null;
      $scope.osList.forEach((os) => {
        if($scope.userInput == os.consoleTitle) {
          osToLaunch = os.consoleTitle;
        }
      });
      if(osToLaunch) {
        $rootScope.$broadcast('start-os-loading', osToLaunch);
        print('Wait for the magic to happen...');
      } else {
        let p = document.createElement('p');
        let node = document.createTextNode('Sorry, I can\'t help you with that.');
        p.appendChild(node);
        consoleElement.appendChild(p);
      }
      break;
    }
    $scope.userInput = '';
    const span = document.createElement('span');
    span.appendChild(document.createTextNode('user:~ '));
    consoleElement.appendChild(span);
    consoleElement.appendChild(input);
    input.focus();
  }

  function print(string) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(string));
    consoleElement.appendChild(p);
  }

  function printOsList() {
    const p = document.createElement('p');
    const table = document.createElement('table');
    table.setAttribute('class', 'consoleHighlight');
    const tr = document.createElement('tr');
    $scope.osList.forEach((os) => {
      const td = document.createElement('td');
      td.appendChild(document.createTextNode(os.consoleTitle));
      tr.appendChild(td);
    });
    table.appendChild(tr);
    p.appendChild(table);
    consoleElement.appendChild(p);
  }

  $http.get('/api/os').then((response) => {
    $scope.osList = response.data;
  });

  $scope.$on('start-os-loading', () => {
    $scope.isLoading = true;
    runLoading();
  });

  $scope.$on('stop-os-loading', () => {
    $scope.isLoading = false;
    stopLoading();
  });

  $scope.enterPress = () => {
    command();
  };

  $scope.setFocus = () => {
    document.getElementById('consoleInput').focus();
  };

  document.getElementById('consoleInput').onfocus = () => {
    if($scope.userInput == '_') {
      $scope.userInput = '';
    }
    $interval.cancel(intervalPromise);
  };

  document.getElementById('consoleInput').onblur = () => {
    if($scope.userInput == '') {
      intervalPromise = runInputHint();
    }
  };

};