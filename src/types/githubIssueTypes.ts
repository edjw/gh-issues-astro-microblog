import type { Endpoints } from "@octokit/types";

export type GithubIssue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][0];

export type GithubIssueWithSlug = GithubIssue & { slug: string };
