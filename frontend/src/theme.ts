import { createTheme }
from "@mui/material/styles";

export const lightTheme =
createTheme({

  palette: {

    mode: "light",

    primary: {

      main: "#00C49A",
      light: "#33d1ae",
      dark: "#009e7c"

    },

    secondary: {

      main: "#F22F22",
      light: "#ff5c4f",
      dark: "#c91f14"

    },

    background: {

      default: "#F2F2F2",
      paper: "#FFFFFF"

    },

    text: {

      primary: "#0D0D0D",
      secondary: "#333333"

    }

  },

  typography: {

    fontFamily:
      '"Inter", "Roboto", sans-serif',

    h4: {
      fontWeight: 700
    },

    h5: {
      fontWeight: 700
    },

    h6: {
      fontWeight: 600
    },

    body1: {
      color: "#333333"
    }

  },

  shape: {
    borderRadius: 16
  }

});

export const darkTheme =
createTheme({

  palette: {

    mode: "dark",

    primary: {

      main: "#00C49A",
      light: "#33d1ae",
      dark: "#009e7c"

    },

    secondary: {

      main: "#F22F22",
      light: "#ff5c4f",
      dark: "#c91f14"

    },

    background: {

      default: "#0D0D0D",
      paper: "#161616"

    },

    text: {

      primary: "#F2F2F2",
      secondary: "#BDBDBD"

    }

  },

  typography: {

    fontFamily:
      '"Inter", "Roboto", sans-serif',

    h4: {
      fontWeight: 700
    },

    h5: {
      fontWeight: 700
    },

    h6: {
      fontWeight: 600
    }

  },

  shape: {
    borderRadius: 16
  }

});