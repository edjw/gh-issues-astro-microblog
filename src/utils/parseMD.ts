import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

const options = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "video"]),
  allowedAttributes: {
  video: [ 'src'],
},

};

export const parseMD = (content: string) => {
  return sanitizeHtml(marked.parse(content), options);
};
