import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
// import netlify from "@astrojs/netlify/functions";
import vercel from "@astrojs/vercel/serverless";
// import vercel from "@astrojs/vercel/edge";

// https://astro.build/config
export default defineConfig({
  site: "https://gh-issues-astro-microblog.netlify.app",
  integrations: [sitemap(), tailwind()],
  output: "server",
  adapter: vercel(),
  // vite: {
  //   ssr: {
  //     external: ["sanitize-html", "@octokit/request"]
  //   }
  // }
});
