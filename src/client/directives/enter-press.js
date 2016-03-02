module.exports = function enterPress() {
  return (scope, element, attrs) => {
    element.bind('keydown keypress', (event) => {
      if (event.which === 13) {
        event.preventDefault();
        scope.$apply(() => {
          scope.$eval(attrs.enterPress);
        });
      }
    });
  };
};
