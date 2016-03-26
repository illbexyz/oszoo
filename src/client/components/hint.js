import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

const hint = () => (
  <ReactCSSTransitionGroup
    transitionAppear={true}
    transitionName={{
      enter: 'animated',
      leave: 'animated',
      appear: 'animated',
      enterActive: 'fadeInDown',
      appearActive: 'fadeInDown',
      leaveActive: 'fadeOutUp',
    }}
    transitionEnterTimeout={1000}
    transitionLeaveTimeout={1000}
    transitionAppearTimeout={1000}
  >
    <div key={0} className="hint">
      Select an os from the dropdown list above
    </div>
  </ReactCSSTransitionGroup>
);

export default hint;
