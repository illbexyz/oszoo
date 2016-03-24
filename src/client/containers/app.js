import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';
import CircularProgress from 'material-ui/lib/circular-progress';

import theme from '../config/theme';

import Header from '../components/header';
import VmToolbar from './vm-toolbar';
import Vm from './vm';
import Hint from '../components/hint';
import { fetchList } from '../actions/os-list';
import { connectSocket } from '../actions/socket';

class App extends Component {

  static propTypes = {
    osList: PropTypes.array.isRequired,
    isRunning: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    waitingFirstFrame: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchList());
    dispatch(connectSocket());
  }

  render() {
    const hint = (
      <div className="hint-container">
        {this.props.waitingFirstFrame ? <CircularProgress/> : <Hint/>}
      </div>
    );
    return (
      <MuiThemeProvider muiTheme={theme}>
        <div className="vm-container">
          <Header/>
          <VmToolbar osList={this.props.osList}/>
          {this.props.isRunning ? <Vm/> : hint}
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => {
  const osList = state.osList.items;
  const isRunning = state.vm.isRunning;
  const waitingFirstFrame = state.vm.waitingFirstFrame;
  return {
    isRunning,
    osList,
    waitingFirstFrame,
  };
};

export default connect(mapStateToProps)(App);
