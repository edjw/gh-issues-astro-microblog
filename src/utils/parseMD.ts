import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

export const parseMD = (content: string) => {
  return DOMPurify.sanitize(marked.parse(content));
};
