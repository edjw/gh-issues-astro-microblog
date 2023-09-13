/// <reference types="@astrojs/image/client" />;

interface ImportMetaEnv {
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_CLOUD_NAME: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly GITHUB_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@11ty/eleventy-fetch";
