import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
// import netlify from "@astrojs/netlify/functions";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://microblog.edjohnsonwilliams.co.uk",
  integrations: [tailwind()],
  output: "server",
  adapter: vercel({
    includeFiles: [
      "./public/fonts/Raleway-Regular.ttf",
      "./public/fonts/Raleway-Bold.ttf",
    ],
  }),
});
