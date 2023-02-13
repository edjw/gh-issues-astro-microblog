// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Ed Johnson-Williams' microblog";
export const SITE_DESCRIPTION = "It's a bit like a blog, but shorter";
export const MAIN_WEBSITE_URL = "https://gh-issues-astro-microblog.netlify.app";

export const repoOwner = "edjw";
export const repoName = "github-issues-headless-cms";
export const postsState: postsStateType = "open";

// showTitles should probably be false if you're making
// a microblog and true if you're doing a blog
export const showTitles: showTitlesType = false;

export const showTags: showTagsType = true;

type postsStateType = "open" | "closed" | "all";
type showTitlesType = boolean;
type showTagsType = boolean;
