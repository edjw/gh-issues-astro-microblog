import type {
  GithubIssue,
  GithubIssueWithSlug,
} from "@/types/githubIssueTypes";
import { processIssues } from "./processIssues";
const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
import { repoName, repoOwner } from "@/consts";

export async function fetchSingleGithubIssue(
  issueNumber: number
): Promise<GithubIssueWithSlug> {
  if (GITHUB_TOKEN === undefined) {
    throw new Error("GITHUB_TOKEN is not defined");
  }
  if (!issueNumber) return {} as GithubIssueWithSlug;

  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues/${issueNumber}`;
  const res = await fetch(url, {
    headers: {
      authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  const data = (await res.json()) as GithubIssue;

  const processedData = processIssues([data])[0] as GithubIssueWithSlug;

  return processedData;
}
