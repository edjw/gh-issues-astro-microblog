import { request } from "@octokit/request";
import slugify from "slugify";

import type { Endpoints } from "@octokit/types";

type GithubIssue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][0];

export type GithubIssueWithSlug = GithubIssue & { slug: string };

import { repoOwner, repoName, postsState, showTitles } from "../consts";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN is not defined");
}

const labelsToExclude = ["draft", "no-publish"];

export async function getAllGithubIssues({
  page = 1,
  per_page = 30,
}: {
  page?: number;
  per_page?: number;
} = {}): Promise<GithubIssueWithSlug[]> {
  try {
    const { data } = await request("GET /repos/{owner}/{repo}/issues", {
      owner: repoOwner,
      repo: repoName,
      state: postsState,
      creator: repoOwner,
      page,
      per_page,
      headers: {
        authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    return processData(data);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getSingleGithubIssue(
  issueNumber: number
): Promise<GithubIssueWithSlug> {
  if (!issueNumber) return {} as GithubIssueWithSlug;

  try {
    const { data } = await request(
      "GET /repos/{owner}/{repo}/issues/{issue_number}",
      {
        owner: repoOwner,
        repo: repoName,
        issue_number: issueNumber,
        headers: {
          authorization: `token ${GITHUB_TOKEN}`,
        },
      }
    );

    return processData(data ? [data] : ([] as GithubIssueWithSlug[]))[0];
  } catch (error) {
    console.error(error);
    return {} as GithubIssueWithSlug;
  }
}

function processData(data: GithubIssue[]): GithubIssueWithSlug[] {
  let processedData = data
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
    .filter((issue) => {
      // Only keep issues that don't have any of the labels in labelsToExclude
      if (issue.labels) {
        return !issue.labels.some((label) =>
          labelsToExclude.includes(label.name)
        );
      }
      return true;
    });

  // If showTitles is false, discard issues that don't have a body
  if (!showTitles) {
    processedData = processedData.filter(
      (issue) =>
        issue.body !== "" && issue.body !== null && issue.body !== undefined
    );
  }

  return processedData;
}
