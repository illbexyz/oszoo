import { connect } from 'react-redux';

import { sendStart, sendStop } from '../actions/vm';
import { selectOs } from '../actions/os-list';

import Toolbar from '../components/toolbar';

function mapStateToProps(state) {
  return {
    socket: state.socketDetails.socket,
    selectedOs: state.osList.selectedOs,
    vmIsRunning: state.vm.isRunning,
    timer: state.vm.timer,
    sessionsAvailable: state.vm.sessionsAvailable,
  };
}

export default connect(mapStateToProps, {
  sendStart,
  sendStop,
  selectOs,
})(Toolbar);
