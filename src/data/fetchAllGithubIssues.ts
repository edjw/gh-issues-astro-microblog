import type { GithubIssueWithSlug } from "@/types/githubIssueTypes";
import { fetchMultipleGithubIssues } from "@/data/fetchMultipleGithubIssues";

async function fetchPageIssues(page: number): Promise<GithubIssueWithSlug[]> {
  const data = await fetchMultipleGithubIssues(page.toString());
  return data;
}

export async function fetchAllGithubIssues() {
  let page = 1;
  let allIssues: GithubIssueWithSlug[] = [];
  let hasNextPage = true;

  while (hasNextPage) {
    const currentPageIssues = await fetchPageIssues(page);

    if (currentPageIssues.length === 0) {
      hasNextPage = false;
    } else {
      allIssues = allIssues.concat(currentPageIssues);
      page++;
    }
  }

  return allIssues;
}
