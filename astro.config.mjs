import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
// import netlify from "@astrojs/netlify/functions";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://gh-issues-astro-microblog.netlify.app",
  integrations: [tailwind()],
  output: "server",
  adapter: vercel({
    includeFiles: ["./public/fonts/**/*"],
  }),
});
