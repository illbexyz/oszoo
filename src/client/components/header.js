import React from 'react';
import AppBar from 'material-ui/lib/app-bar';
import FlatButton from 'material-ui/lib/flat-button';
import Dialog from 'material-ui/lib/dialog';

const Header = React.createClass({

  getInitialState: () => ({ isDialogOpen: false }),

  handleOpen() {
    this.setState({ isDialogOpen: true });
  },

  handleClose() {
    this.setState({ isDialogOpen: false });
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
          title={"OSZOO"}
          showMenuIconButton={false}
          iconElementRight={
            <FlatButton label="About" onTouchTap={this.handleOpen} />
          }
        />
        <Dialog
          title="About"
          actions={actions}
          modal={false}
          open={this.state.isDialogOpen}
          onRequestClose={this.handleClose}
        >
          <div>Developed by <a href="https://github.com/illbexyz">@illbexyz</a>.</div>
          <div>A <a href="http://wiki.v2.cs.unibo.it/wiki/index.php/Main_Page">Virtualsquare</a> project.</div>
        </Dialog>
      </div>
    );
  },
});

export default Header;
