// https://github.com/kevinzunigacuellar/web/blob/main/src/pages/image/%5Bslug%5D.png.ts
// https://rumaan.dev/blog/open-graph-images-using-satori

import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";
import { readFileSync } from "fs";

import type { APIContext } from "astro";
import type { GithubIssueWithSlug } from "../../data/getGithubIssues";

const ralewayRegularFontFile = readFileSync(
  `${process.cwd()}/public/fonts/Raleway-Regular.ttf`
);
const ralewayBoldFontFile = readFileSync(
  `${process.cwd()}/public/fonts/Raleway-Bold.ttf`
);

const dimensions = {
  width: 1200,
  height: 630,
};

const { getSingleGithubIssue } = await import("../../data/getGithubIssues");

export async function get({ params }: APIContext) {
  const { slug } = params;

  const blogPostRegex = new RegExp("^[0-9]+-[a-zA-Z0-9-]+[a-zA-Z0-9]$");

  if (slug === undefined) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const pageIsBlogPost = blogPostRegex.test(slug);
  console.log({ pageIsBlogPost });
  let date = "";
  let title = "";
  let created_at = "";

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  if (pageIsBlogPost) {
    let number: string | undefined;
    let page: GithubIssueWithSlug | undefined;

    number = slug.split("-")[0];

    function isEmpty(obj: any) {
      return Object.keys(obj).length === 0;
    }

    if (number !== undefined) {
      const post = await getSingleGithubIssue(Number(number));

      if (!isEmpty(post) && post.slug !== undefined && post.slug === slug) {
        page = post;
      }
    }

    if (page === undefined) {
      return new Response(null, {
        status: 404,
        statusText: "Not found",
      });
    }

    title = page.title;
    created_at = page.created_at;

    date = new Date(created_at).toLocaleDateString("en-gb", dateOptions);
  }

  if (slug === "index") {
    title = "Ed Johnson-Williams";
    date = new Date().toLocaleDateString("en-gb", dateOptions);
  }

  if (slug === "tagsPage") {
    title = "Tags – Ed Johnson-Williams";
    date = new Date().toLocaleDateString("en-gb", dateOptions);
  }

  if (slug.startsWith("tags-")) {
    const tag = slug.split("tags-")[1];
    title = `Posts tagged as #${tag}`;
    date = new Date().toLocaleDateString("en-gb", dateOptions);
  }

  const markup = html`<div class="bg-gray-100 flex flex-col w-full h-full">
    <div class="flex flex-col w-full h-4/5 p-10 justify-center">
      <div class="flex text-6xl w-full font-bold leading-tight">${title}</div>
      <div class="text-gray-700 text-2xl mt-1">${date}</div>
    </div>
    <div
      class="w-full h-1/5 border-t border-zinc-700/50 flex p-10 flex-col text-2xl"
    >
      <div class="flex items-center">
        <span class="text-gray-400">Ed Johnson-Williams</span>
      </div>
      <div class="flex items-center mt-1">
        <span class="text-base text-gray-700"
          >microblog.edjohnsonwilliams.co.uk</span
        >
      </div>
    </div>
  </div>`;
  const svg = await satori(markup, {
    width: dimensions.width,
    height: dimensions.height,
    fonts: [
      {
        name: "Raleway",
        data: ralewayRegularFontFile,
        weight: 400,
      },
      {
        name: "Raleway",
        data: ralewayBoldFontFile,
        weight: 700,
      },
    ],
  });

  const png = sharp(Buffer.from(svg)).png();
  const response = await png.toBuffer();

  return new Response(response, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "s-maxage=1, stale-while-revalidate=59",
    },
  });
}
