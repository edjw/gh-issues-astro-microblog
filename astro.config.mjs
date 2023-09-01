import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: "https://microblog.edjohnsonwilliams.co.uk",
  integrations: [tailwind()]
  // output: "static",
  // adapter: vercel({
  //   includeFiles: [
  //     "./public/fonts/Raleway-Regular.ttf",
  //     "./public/fonts/Raleway-Bold.ttf",
  //   ],
  // }),
});