import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
// import netlify from "@astrojs/netlify/functions";
// import vercel from "@astrojs/vercel/serverless";

import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: "https://microblog.edjohnsonwilliams.co.uk",
  integrations: [tailwind(), image({
    serviceEntryPoint: '@astrojs/image/sharp'
  })],
  experimental: {
    viewTransitions: true
  },
  redirects: {
    '/': '/posts/1',
    '/24-little-lego-castle': '/post/24-little-lego-castle',
    '/23-the-needles-on-the-isle-of-wight': '/post/23-the-needles-on-the-isle-of-wight',
    '/22-next-book-foghorns': '/post/22-next-book-foghorns',
    '/21-posting-lastfm-summaries-and-this-cms': '/post/21-posting-lastfm-summaries-and-this-cms',
    '/20-my-lastfm-weekly-tracks-chart': '/post/20-my-lastfm-weekly-tracks-chart',
    '/12-holy-fucks-music': '/post/12-holy-fucks-music',
    '/5-so-quick': '/post/5-so-quick',
    '/3-websites-are-nicer-to-publish-than-native-apps': '/post/3-websites-are-nicer-to-publish-than-native-apps',
    '/2-lighthouse': '/post/2-lighthouse',
    '/1-first-post': '/post/1-first-post'
  }

  // output: "static",
  // adapter: vercel({
  //   includeFiles: [
  //     "./public/fonts/Raleway-Regular.ttf",
  //     "./public/fonts/Raleway-Bold.ttf",
  //   ],
  // }),
});