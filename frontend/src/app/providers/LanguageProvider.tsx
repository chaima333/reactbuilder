import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import fr from "../../i18n/fr";
import en from "../../i18n/en";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const translations = {
  fr,
  en,
};

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
 const [language, setLanguage] =
  useState<Language>(() => {
    const saved =
      localStorage.getItem("language");

    if (
      saved === "fr" ||
      saved === "en"
    ) {
      return saved as Language;
    }

    return "fr";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = "ltr";
    document.documentElement.lang = language;
  }, [language]);
const t =
  translations[language as keyof typeof translations];

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used within LanguageProvider"
    );
  }

  return context;
};