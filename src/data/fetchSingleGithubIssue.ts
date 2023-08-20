import type {
  GithubIssue,
  GithubIssueWithSlug,
} from "@/types/githubIssueTypes";
import { processIssues } from "./processIssues";
import { repoName, repoOwner } from "@/consts";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

export async function fetchSingleGithubIssue(
  issueNumber: number
): Promise<GithubIssueWithSlug> {
  if (!issueNumber) return {} as GithubIssueWithSlug;

  if (GITHUB_TOKEN === undefined) {
    throw new Error("GITHUB_TOKEN is not defined");
  }

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  if (res.headers.get("X-RateLimit-Remaining") === "0") {
    const resetTime = new Date(
      Number(res.headers.get("X-RateLimit-Reset")) * 1000
    );
    const currentTime = new Date();
    const timeToWait = resetTime.getTime() - currentTime.getTime();

    console.error(
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
    console.error(await res.text());
    throw new Error("Failed to fetch data");
  }

  const data = (await res.json()) as GithubIssue;
  const processedData = processIssues([data])[0] as GithubIssueWithSlug;

  return processedData;
}
