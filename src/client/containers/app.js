import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import MuiThemeProvider from 'material-ui/lib/MuiThemeProvider';

import theme from '../config/theme';

import Header from '../components/header';
import VmToolbar from '../containers/vm-toolbar';
import Vm from '../containers/vm';
import { fetchList } from '../actions/os-list';
import { connectSocket } from '../actions/socket';

class App extends Component {

  static propTypes = {
    osList: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchList());
    dispatch(connectSocket());
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={theme}>
        <div className="vm-container">
          <Header/>
          <VmToolbar osList={this.props.osList}/>
          <Vm/>
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = (state) => {
  const osList = state.osList.items || [];
  return {
    osList,
  };
};

export default connect(mapStateToProps)(App);
