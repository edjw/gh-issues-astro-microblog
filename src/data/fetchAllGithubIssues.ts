import type { GithubIssueWithSlug } from "@/types/githubIssueTypes";
import { fetchMultipleGithubIssues } from "@/data/fetchMultipleGithubIssues";

async function fetchCurrentPageIssues(page: number) {
  const data = await fetchMultipleGithubIssues(page.toString());
  return data;
}

async function fetchNextPageLength(page: number): Promise<number> {
  const nextPage = page + 1;
  const data = await fetchMultipleGithubIssues(nextPage.toString());
  return data.length;
}

export async function fetchAllGithubIssues() {
  const page = 1;
  let allIssues: GithubIssueWithSlug[] = [];

  while (true) {
    const currentPageIssues = await fetchCurrentPageIssues(page);
    allIssues = allIssues.concat(currentPageIssues);

    const nextPageIssuesLength = await fetchNextPageLength(page);

    if (nextPageIssuesLength === 0) {
      break;
    }
  }

  return allIssues;
}
