import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

export const parseMD = (content: string) => {
  return sanitizeHtml(marked.parse(content));
};
