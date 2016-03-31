import { connect } from 'react-redux';
import { sendKeydown, sendKeyup, sendMouseMove, sendMouseDown, sendMouseUp } from '../actions/vm';

import Vm from '../components/vm';

function mapStateToProps(state) {
  const { lastFrame, isRunning, size } = state.vm;
  return {
    isRunning,
    lastFrame,
    size,
  };
}

function mapDispatchToProps() {
  return {
    sendKeydown,
    sendKeyup,
    sendMouseMove,
    sendMouseDown,
    sendMouseUp,
  };
}

export default connect(mapStateToProps, mapDispatchToProps())(Vm);
