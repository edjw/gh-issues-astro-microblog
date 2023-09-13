import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";

// import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://microblog.edjohnsonwilliams.co.uk",
  integrations: [tailwind(), svelte()],
  output: "static",

  // adapter: vercel({
  //   includeFiles: [
  //     "./public/fonts/Raleway-Regular.ttf",
  //     "./public/fonts/Raleway-Bold.ttf",
  //   ],
  // }),

});