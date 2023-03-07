import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_TITLE, SITE_DESCRIPTION } from "@/consts";
import { fetchAllGithubIssues } from "@/data/fetchAllGithubIssues";
const posts = await fetchAllGithubIssues();
import { parseMD } from "@/utils/parseMD";

export async function get(context: APIContext) {
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: String(context.site),
    items: posts.map((post) => ({
      title: post.title,
      pubDate: new Date(post.created_at),
      content: parseMD(post.body || ""),
      link: `/post/${post.slug}/`,
    })),
  });
}
