/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Ajoute tes autres variables ici
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}