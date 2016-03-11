import { connect } from 'react-redux';

import { sendStart } from '../actions/vm';
import { selectOs } from '../actions/os-list';

import Toolbar from '../components/toolbar';

function mapStateToProps(state) {
  return {
    socket: state.socketDetails.socket,
    selectedOs: state.osList.selectedOs,
  };
}

export default connect(mapStateToProps, {
  sendStart,
  selectOs,
})(Toolbar);
