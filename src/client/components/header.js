import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';

const Header = React.createClass({

  getInitialState: () => ({ open: false }),

  handleOpen() {
    this.setState({ open: true });
  },

  handleClose() {
    this.setState({ open: false });
  },

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        secondary={true}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.handleClose}
      />,
    ];
    return (
      <div>
        <AppBar
          title="OSZoo"
          iconElementRight={
            <FlatButton label="About" onTouchTap={this.handleOpen} />
          }
        />
        <Dialog
          title="Dialog With Actions"
          actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
          <span>The actions in this window were passed in as an array of React objects.</span>
        </Dialog>
      </div>
    );
  },
});

export default Header;
