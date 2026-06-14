// frontend/src/theme.ts

import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#00C49A",
      light: "#33d1ae",
      dark: "#009e7c",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F22F22",
      light: "#ff5c4f",
      dark: "#c91f14",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F2F2F2",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0D0D0D",
      secondary: "#333333",
      disabled: "#999999",
    },
    divider: "#E0E0E0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      color: "#333333",
    },
    body2: {
      color: "#333333",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00C49A",
      light: "#33d1ae",
      dark: "#009e7c",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F22F22",
      light: "#ff5c4f",
      dark: "#c91f14",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#0D0D0D",
      paper: "#161616",
    },
    text: {
      primary: "#F2F2F2",
      secondary: "#BDBDBD",
      disabled: "#6B6B6B",
    },
    divider: "#2A2A2A",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      color: "#F2F2F2",
    },
    body2: {
      color: "#BDBDBD",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Theme toggle helper
export const getTheme = (mode: "light" | "dark") => {
  return mode === "light" ? lightTheme : darkTheme;
};

// localStorage helpers
export const getStoredTheme = (): "light" | "dark" => {
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  return "light";
};

export const setStoredTheme = (mode: "light" | "dark") => {
  localStorage.setItem("theme", mode);
};