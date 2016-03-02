module.exports = function console($scope, $http, $interval, vm) {
  $scope.userInput = '';
  $scope.loadingSymbol = '|';

  function runInputHint() {
    return $interval(() => {
      if ($scope.userInput === '') {
        $scope.userInput = '_';
      } else if ($scope.userInput === '_') {
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

  const consoleElement = document.getElementById('consoleBody');
  let intervalPromise = runInputHint();
  let loadingInterval = null;

  function startLoading() {
    if (loadingInterval) {
      loadingInterval = $interval(loadingAnimation, 80);
    }
  }

  function stopLoading() {
    if (loadingInterval) {
      $interval.cancel(loadingInterval);
      loadingInterval = null;
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
            osToLaunch = os;
          }
        });
        if(osToLaunch) {
          startLoading();
          vm.start(osToLaunch, () => {
            stopLoading();
          });
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

  $scope.$on('console-start-loading', () => {
    startLoading();
  });

  $scope.$on('console-stop-loading', () => {
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
