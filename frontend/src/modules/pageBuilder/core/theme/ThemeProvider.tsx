// frontend/src/modules/pageBuilder/core/theme/ThemeProvider.tsx
import React, { createContext, useContext } from "react";



const defaultTokens = {
  colors: {
    primary: "#10b981", // Emerald Green
    secondary: "#3b82f6",
    text: "#1f2937",
    background: "#ffffff"
  },
  spacing: {
    m: "16px",
    s: "8px"
  }
};

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children, value }: any) => {
  // 2. إذا ما فماش value، استعمل الـ defaultTokens
  const themeValue = value || { tokens: defaultTokens };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. تأمين الـ Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    return { tokens: defaultTokens };
  }
  return context;
};

