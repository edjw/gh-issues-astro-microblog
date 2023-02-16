import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
// import netlify from "@astrojs/netlify/functions";
import vercel from "@astrojs/vercel/serverless";
import { readFileSync } from "node:fs";

// https://astro.build/config
export default defineConfig({
  site: "https://gh-issues-astro-microblog.netlify.app",
  integrations: [tailwind()],
  output: "server",
  adapter: vercel(),
  // https://github.com/kevinzunigacuellar/web/blob/e2e9beed3bc8133acff2d1c02b46e35a81065263/astro.config.ts#L24
  vite: {
    plugins: [rawFonts([".woff"])],
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});

// vite plugin to import fonts
// https://github.com/kevinzunigacuellar/web/blob/e2e9beed3bc8133acff2d1c02b46e35a81065263/astro.config.ts#L32
function rawFonts(ext) {
  return {
    name: "vite-plugin-raw-fonts",
    transform(_, id) {
      if (ext.some((e) => id.endsWith(e))) {
        const buffer = readFileSync(id);
        return {
          code: `export default ${JSON.stringify(buffer)}`,
          map: null,
        };
      }
    },
  };
}
