import slugify from "slugify";
import type {
  OriginalGitHubIssue,
  ProcessedGitHubIssue,
} from "./githubIssueTypes";

const repoOwner = "edjw";
const repoName = "github-issues-headless-cms";
const postsState = "open";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;

export async function getGithubIssues(
  owner: string = repoOwner,
  repo: string = repoName,
  state: string = postsState
): Promise<ProcessedGitHubIssue[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}`;
  const response = await fetch(url, {
    headers: {
      authorization: `token ${GITHUB_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  let data = await response.json();

  if (!Array.isArray(data)) {
    data = [data];
  }

  const processedData: ProcessedGitHubIssue[] = data
    .map((issue: OriginalGitHubIssue) => {
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
    .filter((issue: OriginalGitHubIssue) => issue.user.login === repoOwner);
  return processedData;
}
