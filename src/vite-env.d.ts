/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AIOX_ENGINE_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

