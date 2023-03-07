import { fetchAllGithubIssues } from "@/data/fetchAllGithubIssues";

import type { Label } from "@/types/githubLabelType";

export async function fetchAllIssueLabels() {
  const allPosts = await fetchAllGithubIssues();

  // get a list of all unique label names sorted alphabetically and make sure label is not a string
  const allLabels = allPosts
    .map((post) => post.labels)
    .flat()
    .reduce((acc: Label[], label) => {
      if (
        typeof label !== "string" &&
        !acc.find((l) => l.name === label.name)
      ) {
        acc.push(label);
      }
      return acc;
    }, [])
    .sort((a, b) => {
      if (a.name !== undefined && b.name !== undefined) {
        return a.name.localeCompare(b.name);
      } else {
        return 0;
      }
    });

  return allLabels;
}
