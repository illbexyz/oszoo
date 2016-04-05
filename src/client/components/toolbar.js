import React, { PropTypes } from 'react';
import IconButton from 'material-ui/lib/icon-button';
import Badge from 'material-ui/lib/badge';
import MenuItem from 'material-ui/lib/menus/menu-item';
import DropDownMenu from 'material-ui/lib/DropDownMenu';
import RaisedButton from 'material-ui/lib/raised-button';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarSeparator from 'material-ui/lib/toolbar/toolbar-separator';
import InfoOutlineIcon from 'material-ui/lib/svg-icons/action/info-outline';
import TimerIcon from 'material-ui/lib/svg-icons/image/timer';

class VmToolbar extends React.Component {

  static propTypes = {
    selectOs: PropTypes.func.isRequired,
    osList: PropTypes.array.isRequired,
    sendStart: PropTypes.func.isRequired,
    sendStop: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
    selectedOs: PropTypes.object.isRequired,
    vmIsRunning: PropTypes.bool,
    waitingFirstFrame: PropTypes.bool,
    timer: PropTypes.number,
    sessionsAvailable: PropTypes.number,
  };

  static defaultProps = {
    osList: [],
    socket: {},
    os: {},
  };

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      value: 0,
    };
  }

  handleChange(event, index, value) {
    this.setState({ value });
    if (value > 0) {
      this.props.selectOs(this.props.osList[value - 1]);
    } else {
      this.props.selectOs({});
    }
  }

  startVm() {
    this.props.sendStart(this.props.selectedOs);
  }

  render() {
    const oslist = this.props.osList
      .map((os, index) => <MenuItem key={index + 1} value={index + 1} primaryText={os.title} />);

    const vmButton = (this.props.vmIsRunning || this.props.waitingFirstFrame) ?
      <RaisedButton
        label="Stop"
        disabled={!this.state.value}
        secondary
        onTouchTap={this.props.sendStop}
      />
      :
      <RaisedButton
        label="Start"
        secondary
        disabled={!this.state.value || !this.props.sessionsAvailable}
        onTouchTap={this.startVm.bind(this)}/>;

    const timeRemainingBadge = this.props.vmIsRunning ?
      <Badge
        badgeContent={this.props.timer}
        secondary
        badgeStyle={{ top: 6, right: 10 }}
        disabled
      >
        <IconButton
          style={{ bottom: 18 }}
          tooltip="Minutes Remaining"
        >
          <TimerIcon />
        </IconButton>
      </Badge>
      :
      <IconButton
        style={{ top: 6 }}
        tooltip="Minutes Remaining"
        disabled
      >
        <TimerIcon />
      </IconButton>;

    return (
      <Toolbar>
        <ToolbarGroup firstChild float="left">
          <DropDownMenu
            value={this.state.value}
            onChange={this.handleChange}
          >
            <MenuItem key={0} value={0} primaryText="Select an OS" />
            {oslist}
          </DropDownMenu>
        </ToolbarGroup>
        <ToolbarGroup float="right">
          {vmButton}
          <ToolbarSeparator />
          <Badge
            badgeContent={this.props.sessionsAvailable}
            secondary
            badgeStyle={{ top: 6, right: 10 }}
          >
            <IconButton
              style={{ bottom: 18 }}
              tooltip="Sessions available"
            >
              <InfoOutlineIcon />
            </IconButton>
          </Badge>
          {timeRemainingBadge}
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

export default VmToolbar;
