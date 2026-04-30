// frontend/src/modules/pageBuilder/core/theme/ThemeProvider.tsx
import React, { createContext, useContext } from "react";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children, value }: any) => {
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);