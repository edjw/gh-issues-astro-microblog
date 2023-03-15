/// <reference types="@astrojs/image/client" />;

interface ImportMetaEnv {
  readonly GITHUB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
