import { request } from "@octokit/request";
import slugify from "slugify";

import type { Endpoints } from "@octokit/types";

type GithubIssue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][0];
export type GithubIssueWithSlug = GithubIssue & { slug: string };

import { repoOwner, repoName, postsState, showTitles } from "../consts";

let GITHUB_TOKEN: string = "";

if (import.meta.env.GITHUB_TOKEN) {
  GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
} else if (process.env.GITHUB_TOKEN) {
  GITHUB_TOKEN = process.env.GITHUB_TOKEN;
}

if (GITHUB_TOKEN === "") {
  console.warn("No GitHub token found.");
  console.warn({ GITHUB_TOKEN });
}

export async function getGithubIssues(
  specificIssueNumber?: number,
  page: number = 1
): Promise<GithubIssueWithSlug[]> {
  if (specificIssueNumber) {
    const { data } = await request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: repoOwner,
        repo: repoName,
        issue_number: specificIssueNumber,
        headers: {
          authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );
    return processData(data ? [data] : ([] as GithubIssueWithSlug[]));
  } else {
    const { data } = await request("GET /repos/{owner}/{repo}/issues", {
      owner: repoOwner,
      repo: repoName,
      state: postsState,
      creator: repoOwner,
      page,
      headers: {
        authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    return processData(data);
  }
}

function processData(data: GithubIssue[]): GithubIssueWithSlug[] {
  const processedData = data
    .map((issue) => {
      const slug = slugify(`${issue.number}-${issue.title}`, {
        lower: true,
        strict: true,
        replacement: "-",
      });
      return {
        ...issue,
        slug,
      };
    })
    .filter((issue) => issue.user && issue.user.login === repoOwner)
    .filter((issue) => {
      if (showTitles) {
        return true;
      }
      return (
        issue.body !== null && issue.body !== undefined && issue.body !== ""
      );
    });
  return processedData;
}
