import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify/functions";

export default defineConfig({
  site: "https://example.com",
  integrations: [sitemap(), tailwind()],
  output: "server",
  adapter: netlify(),
});
