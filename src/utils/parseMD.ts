import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { v2 as cloudinary } from "cloudinary";
// import fetch from "node-fetch";
// import { https } from "follow-redirects";
import pkg from "follow-redirects";
const { https } = pkg;
import { ASSETS_URL } from "../consts";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const CLOUDINARY_CLOUD_NAME = import.meta.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.CLOUDINARY_API_SECRET;

const videoFileTypes = [".mov", ".mp4"];

const isURLVideo = (url: string): boolean => {
  if (!url) return false;
  const fileType = url.substring(url.lastIndexOf(".")).toLowerCase();
  const isVideo = videoFileTypes.includes(fileType);
  // console.log(`URL: ${url}, isVideo: ${isVideo}`);
  return isVideo;
};

const isAssetURL = (url: string): boolean => {
  return url.startsWith(ASSETS_URL);
};

const fetchRedirectUrl = async (url: string): Promise<string | null> => {
  if (!url.startsWith(ASSETS_URL)) {
    return url; // Return the original URL if it doesn't start with ASSETS_URL
  }
  // console.log(`Fetching redirect URL for: ${url}`);

  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            Authorization: `token ${GITHUB_TOKEN}`,
          },
        },
        (response) => {
          const { statusCode, statusMessage, responseUrl } = response;

          if (statusCode && statusCode >= 200 && statusCode < 400) {
            // console.log(`Final URL: ${responseUrl}`);
            resolve(responseUrl);
          } else {
            console.error(
              `Error fetching URL: ${url}. Status: ${statusCode} - ${statusMessage}`
            );
            // console.log({ response });
            resolve(null); // Use resolve with null instead of reject to mimic the previous behavior
          }

          response.on("data", () => {}); // Consume response data to free up memory
        }
      )
      .on("error", (err) => {
        console.error("Failed to fetch the redirect URL:", err.message);
        resolve(null); // Use resolve with null instead of reject to mimic the previous behavior
      });
  });
};

cloudinary.config({
  secure: true,
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (url: string, type: "image" | "video") => {
  const options = {
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    resource_type: type,
  };

  try {
    const result = await cloudinary.uploader.upload(url, options);
    // console.log("Uploaded to Cloudindary: ", result.secure_url, "\n");
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", { error, url, type });
    return null;
  }
};

const extractUrlsFromMarkdown = (content: string): string[] => {
  const urls: string[] = [];
  const tempRenderer = new marked.Renderer();

  tempRenderer.link = (href) => {
    if (
      isURLVideo(href) ||
      href.match(/\.(jpeg|jpg|gif|png)$/i) ||
      isAssetURL(href)
    ) {
      urls.push(href);
    }
    return href;
  };

  tempRenderer.image = (href) => {
    if (
      isURLVideo(href) ||
      href.match(/\.(jpeg|jpg|gif|png)$/i) ||
      isAssetURL(href)
    ) {
      urls.push(href);
    }
    return href;
  };

  marked.use({ renderer: tempRenderer });
  marked.parse(content);
  return urls;
};
const processUrls = async (urls: string[]): Promise<Map<string, string>> => {
  const urlMap: Map<string, string> = new Map();

  for (const url of urls) {
    const finalUrl = await fetchRedirectUrl(url);
    const assetType = isURLVideo(finalUrl) ? "video" : "image";

    if (!finalUrl) {
      console.error("Final URL not found for: ", url);
      continue; // Skip to the next iteration without trying to upload
    }

    // Change the asset type determination to be based on the finalUrl, not the original URL
    // console.log(`Asset Type for URL ${finalUrl} is ${assetType}`);

    // console.log(`Final URL: ${finalUrl}, assetType: ${assetType}`); // Debugging line

    const transformedHref = await uploadToCloudinary(finalUrl, assetType);

    if (transformedHref) {
      urlMap.set(url, transformedHref.url);
    }
  }
  return urlMap;
};

const renderer = new marked.Renderer();

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

export const parseMD = async (content: string): Promise<string> => {
  const urls = extractUrlsFromMarkdown(content);
  const processedUrlMap = await processUrls(urls);

  renderer.link = (href, title, text) => {
    if (
      isURLVideo(href) ||
      href.match(/\.(jpeg|jpg|gif|png)$/i) ||
      isAssetURL(href)
    ) {
      const processedUrl = processedUrlMap.get(href) || href;
      return `<a href="${processedUrl}">${text}</a>`;
    }
    return `<a href="${href}">${text}</a>`;
  };

  renderer.image = (href, title, text) => {
    if (
      isURLVideo(href) ||
      href.match(/\.(jpeg|jpg|gif|png)$/i) ||
      isAssetURL(href)
    ) {
      const processedUrl = processedUrlMap.get(href) || href;
      return `<img src="${processedUrl}" alt="${text}" title="${
        title || ""
      }" />`;
    }
    return `<img src="${href}" alt="${text}" title="${title || ""}" />`;
  };

  marked.use({ renderer });
  return sanitizeHtml(marked.parse(content), sanitizeHTMLOptions);
};
