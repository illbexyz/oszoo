import {
  indigo500, indigo700,
  // grey400,
  deepOrangeA400,
  grey100, grey500,
} from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';

let muiTheme = getMuiTheme({
  palette: {
    primary1Color: indigo500,
    primary2Color: indigo700,
    primary3Color: indigo700,
    accent1Color: deepOrangeA400,
    accent2Color: grey100,
    accent3Color: grey500,
  },
});

// const { palette } = muiTheme;

muiTheme = {
  ...muiTheme,
};

export default muiTheme;
