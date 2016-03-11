import React, { PropTypes } from 'react';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import IconButton from 'material-ui/lib/icon-button';
import FontIcon from 'material-ui/lib/font-icon';
import NavigationExpandMoreIcon from 'material-ui/lib/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/lib/menus/menu-item';
import DropDownMenu from 'material-ui/lib/DropDownMenu';
import RaisedButton from 'material-ui/lib/raised-button';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarSeparator from 'material-ui/lib/toolbar/toolbar-separator';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';

class VmToolbar extends React.Component {

  static propTypes = {
    selectOs: PropTypes.func.isRequired,
    osList: PropTypes.array.isRequired,
    sendStart: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired,
    selectedOs: PropTypes.object.isRequired,
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
    this.props.selectOs(this.props.osList[value]);
  }

  startVm() {
    this.props.sendStart(this.props.socket, this.props.selectedOs);
  }

  render() {
    const osList = this.props.osList
      .map((os, index) => <MenuItem key={index} value={index} primaryText={os.title} />);
    if (osList.length === 0) {
      osList.push(<MenuItem key={0} value={0} primaryText="Select an OS" />);
    }
    return (
      <Toolbar>
        <ToolbarGroup firstChild={true} float="left">
          <DropDownMenu value={this.state.value} onChange={this.handleChange}>
            {osList}
          </DropDownMenu>
        </ToolbarGroup>
        <ToolbarGroup float="right">
          <ToolbarTitle text="Options" style={{ width: 90 }} />
          <FontIcon className="muidocs-icon-custom-sort" />
          <IconMenu
            iconButtonElement={
              <IconButton touch={true}>
                <NavigationExpandMoreIcon />
              </IconButton>
            }
          >
            <MenuItem primaryText="Download" />
            <MenuItem primaryText="More Info" />
          </IconMenu>
          <ToolbarSeparator />
          <RaisedButton label="Start" primary={true} onTouchTap={this.startVm.bind(this)} />
        </ToolbarGroup>
      </Toolbar>
    );
  }
}

export default VmToolbar;
