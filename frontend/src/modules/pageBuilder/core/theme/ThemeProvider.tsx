import React, {
  createContext,
  useContext,
  useState
} from "react";

const defaultTokens = {

  colors: {

    brand: {

      primary: "#10b981",

      secondary: "#3b82f6",
    },

    text: {

      primary: "#1f2937",

      inverse: "#ffffff",

      muted: "#777777",
    },

    background: {

      default: "#ffffff",

      surface: "#f5f5f5",
    }
  },

  spacing: {

    s: "8px",

    m: "16px",
  },

  typography: {

    fontFamily:
      "'Montserrat', sans-serif",

    h1: "32px",

    body: "16px",
  }
};

const ThemeContext =
  createContext<any>(null);

export const ThemeProvider = ({
  children,
  value
}: any) => {

  const [tokens, setTokens] =
    useState({

      ...defaultTokens,

      ...(value?.tokens || {})
    });

  const updateToken = (
    path:string,
    newValue:any
  ) => {

    setTokens((prev:any) => {

      const updated = {
        ...prev
      };

      const keys =
        path.split(".");

      let current =
        updated;

      for (
        let i = 0;
        i < keys.length - 1;
        i++
      ) {

        current =
          current[keys[i]];
      }

      current[
        keys[
          keys.length - 1
        ]
      ] = newValue;

      return {
        ...updated
      };
    });
  };

  return (

    <ThemeContext.Provider
      value={{

        tokens,

        setTokens,

        updateToken
      }}
    >

      {children}

    </ThemeContext.Provider>
  );
};

export const useTheme = () => {

  const context =
    useContext(
      ThemeContext
    );

  if (!context) {

    throw new Error(
      "useTheme must be used within ThemeProvider"
    );
  }

  return context;
};