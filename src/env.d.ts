/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string;
    // add other VITE_ variables here if needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  