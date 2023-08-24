import type {
  GithubIssue,
  GithubIssueWithSlug,
} from "@/types/githubIssueTypes";
import { processIssues } from "@/data/processIssues";
import { postsState, repoName, repoOwner } from "@/consts";
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

export async function fetchMultipleGithubIssues(
  page?: string,
  perPage?: string
) {
  if (GITHUB_TOKEN === undefined) {
    throw new Error("GITHUB_TOKEN is not defined");
  }

  if (page === undefined) {
    page = "1";
  }

  if (perPage === undefined) {
    perPage = "30";
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=${postsState}&page=${page}&per_page=${perPage}`;
  // const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues?state=${postsState}&page=${page}&per_page=${perPage}`;
  const res = await fetch(url, {
    headers: {
      authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  if (res.headers.get("X-RateLimit-Remaining") === "0") {
    const resetTime = new Date(
      Number(res.headers.get("X-RateLimit-Reset")) * 1000
    );
    const currentTime = new Date();
    const timeToWait = resetTime.getTime() - currentTime.getTime();

    console.log(
      `Rate limit hit.  Need to wait for ${Math.round(
        timeToWait / 1000 / 60
      )} minutes.`
    );
    throw new Error(
      `GitHub API rate limit exceeded. Need to wait for ${Math.round(
        timeToWait / 1000 / 60
      )} minutes.`
    );
  }

  if (!res.ok) {
    console.log(await res.text());
    throw new Error("Failed to fetch data");
  }

  const processedData = processIssues(
    (await res.json()) as GithubIssue[]
  ) as GithubIssueWithSlug[];

  // console.log(`Fetched ${processedData.length} issues for page ${page}`);

  return processedData;
}
