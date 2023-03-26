export default function extractLinks(body: string, linkPost: boolean) {
  let linkURLs: string[] = [];

  const markdownURLRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const urlRegex = /((https?:\/\/)|(www\.))[^\s]+/g;

  const isImageVideoURL = (href: string) => {
    const url = href.toLowerCase();
    if (
      url.endsWith(".png") ||
      url.endsWith(".jpg") ||
      url.endsWith(".jpeg") ||
      url.endsWith(".gif") ||
      url.endsWith(".mov")
    ) {
      return true;
    } else {
      return false;
    }
  };

  if (linkPost && body !== undefined && body !== null) {
    const markdownURLs = [...body.matchAll(markdownURLRegex)];

    const bareURLs = [...body.matchAll(urlRegex)];

    if (markdownURLs.length > 0) {
      markdownURLs.forEach((url) => {
        const href = url[2];

        if (
          isImageVideoURL(href) === false &&
          linkURLs.includes(href) === false
        ) {
          linkURLs.push(href);
        }
      });
    }

    if (bareURLs.length > 0) {
      bareURLs.forEach((url) => {
        const href = url[0].replace(").", "").replace(")", "");

        if (
          isImageVideoURL(href) === false &&
          linkURLs.includes(href) === false
        ) {
          linkURLs.push(href);
        }
      });
    }
  }

  return linkURLs;
}
