import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";
import { getAllGithubIssues } from "../data/getGithubIssues";
const posts = await getAllGithubIssues({
  per_page: 100,
});
import { parseMD } from "../utils/parseMD";

export async function get(context: APIContext) {
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: String(context.site),
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.created_at),
      content: parseMD(post.body || ""),
      // Compute RSS link from post `slug`
      // This example assumes all posts are rendered as `/blog/[slug]` routes
      link: `/${post.slug}/`,
    })),
  });
}
