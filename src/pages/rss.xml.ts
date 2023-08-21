import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/consts";
import { fetchAllGithubIssues } from "@/data/fetchAllGithubIssues";
import { parseMD } from "@/utils/parseMD";
const posts = await fetchAllGithubIssues();

const processedPosts = posts.map(async (post) => {
  return {
    title: post.title,
    pubDate: new Date(post.created_at),
    content: (await Promise.all(await parseMD(post.body || ""))) || "",
    link: `/post/${post.slug}/`,
  };
});

// export async function get(context: APIContext) {
//   return rss({
//     title: SITE_TITLE,
//     description: SITE_DESCRIPTION,
//     site: String(context.site),
//     items: posts.map(async (post) => ({
//       title: post.title,
//       pubDate: new Date(post.created_at),
//       content: (await Promise.all(await parseMD(post.body || ""))) || "",
//       link: `/post/${post.slug}/`,
//     })),
//   });
// }

export async function get(context: APIContext) {
  const feedItems = await Promise.all(
    posts.map(async (post) => {
      const parsedContent = await parseMD(post.body || "");

      return {
        title: post.title,
        pubDate: new Date(post.created_at),
        content: parsedContent,
        link: `/post/${post.slug}/`,
      };
    })
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: String(context.site),
    items: feedItems, // Use the resolved array of feed items
  });
}
