import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  site: "https://gh-issues-astro-microblog.netlify.app",
  integrations: [sitemap(), tailwind()],
  output: "server",
  adapter: netlify(),
  vite: {
    ssr: {
      external: ["sanitize-html", "@octokit/request"],
    },
  },
});
