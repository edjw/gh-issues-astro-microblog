import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const videoFileTypes = [".mov", ".mp4"];
const isURLVideo = (url: string): boolean => {
  const fileType = url.substring(url.lastIndexOf(".")).toLowerCase();
  return videoFileTypes.includes(fileType);
};

const renderer = new marked.Renderer();
renderer.link = (href, title, text): string => {
  if (href !== null && isURLVideo(href)) {
    return `<div class="flex justify-center"><video controls muted preload="metadata" class="max-h-72 my-0 border dark:border-gray-500">
              <source src="${href}" type="video/mp4">
            </video></div>`;
  } else if (title !== null && title !== undefined) {
    return `<a href="${href}" title="${title}">${text}</a>`;
  } else {
    return `<a href="${href}">${text}</a>`;
  }
};

marked.use({ renderer });

const sanitizeHTMLOptions: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "video",
    "source",
  ]),
  allowedAttributes: {
    video: [
      "src",
      "controls",
      "type",
      "muted",
      "autoplay",
      "preload",
      "class",
      "style",
    ],
    source: ["src", "type"],
    img: ["src", "alt"],
    a: ["href", "title"],
    div: ["class", "style"],
  },
};

export const parseMD = (content: string) => {
  return sanitizeHtml(marked.parse(content), sanitizeHTMLOptions);
};
