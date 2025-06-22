/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_USE_MOCKS: string;
  readonly MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_GOLD_SAS_TOKEN: string;
  readonly VITE_DELTA_SHARING_ENDPOINT: string;
  readonly VITE_DELTA_SHARING_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}