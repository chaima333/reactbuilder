import { createContext, useContext } from "react";


interface ThemeContextType {
  tokens: Record<string, any>; 
  updateToken: (key: string, value: string) => void; 
}


export const ThemeContext = createContext<ThemeContextType | null>(null);


export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContext.Provider");
  }
  
  return context;
};