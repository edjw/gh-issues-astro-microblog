import slugify from "slugify";
import { showTitles } from "@/consts";

import type { Endpoints } from "@octokit/types";

type GithubIssue =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"][0];

type GithubIssueWithSlug = GithubIssue & { slug: string };

const labelsToExclude = ["draft", "no-publish"];

export function processIssues(data: GithubIssue[]): GithubIssueWithSlug[] {
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
        return !issue.labels.some((label) => {
          // if (typeof label === "string" || typeof label.name === "undefined")
          //   return false;
          return labelsToExclude.includes(label.name);
        });
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
