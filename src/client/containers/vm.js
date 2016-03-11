import { connect } from 'react-redux';
import { sendKeydown, sendMouseMove, sendMouseDown, sendMouseUp } from '../actions/vm';

import Vm from '../components/vm';

function mapStateToProps(state) {
  const { lastFrame, isRunning } = state.vm;
  return {
    isRunning,
    lastFrame,
  };
}

function mapDispatchToProps() {
  return {
    sendKeydown,
    sendMouseMove,
    sendMouseDown,
    sendMouseUp,
  };
}

export default connect(mapStateToProps, mapDispatchToProps())(Vm);
