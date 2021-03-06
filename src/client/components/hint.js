import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import React from 'react';

const hint = (props) => {
  const text = props.sessionsAvailable ?
    'Select an os from the dropdown list above'
    :
    'No sessions available now, wait a bit :(';
  return (
    <ReactCSSTransitionGroup
      transitionAppear
      transitionName={{
        enter: 'animated',
        leave: 'animated',
        appear: 'animated',
        enterActive: 'fadeInDown',
        appearActive: 'fadeInDown',
        leaveActive: 'fadeOut',
      }}
      transitionEnterTimeout={1000}
      transitionLeaveTimeout={1000}
      transitionAppearTimeout={1000}
    >
      <div key={0} className="hint">
        {text}
      </div>
    </ReactCSSTransitionGroup>
  );
};

hint.propTypes = {
  sessionsAvailable: React.PropTypes.number.isRequired,
};

export default hint;
