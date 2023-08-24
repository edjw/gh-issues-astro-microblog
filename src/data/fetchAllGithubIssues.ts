import type { GithubIssueWithSlug } from "@/types/githubIssueTypes";
import { fetchMultipleGithubIssues } from "@/data/fetchMultipleGithubIssues";

async function fetchPageIssues(page: number): Promise<GithubIssueWithSlug[]> {
  const data = await fetchMultipleGithubIssues(page.toString());
  return data;
}

let cachedIssues: GithubIssueWithSlug[] | null = null;

export async function fetchAllGithubIssues() {
  if (cachedIssues) {
    return cachedIssues;
  }

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

  cachedIssues = allIssues;

  console.log("Total number of issues fetched:", allIssues.length);

  return allIssues;
}
