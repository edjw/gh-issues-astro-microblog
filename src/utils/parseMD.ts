import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import pkg from "follow-redirects";
const { https } = pkg;

import {
  createEmptyJSONFileIfNotExists,
  readJSONFile,
  writeJSONFile,
} from "./fsFunctions";
import { ASSETS_URL } from "@/consts";

const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
const CLOUDINARY_CLOUD_NAME = import.meta.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = import.meta.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = import.meta.env.CLOUDINARY_API_SECRET;

// Checks if a link is for a video
const isURLVideo = (url: string): boolean => {
  if (!url) return false;
  const videoFileTypes = [".mov", ".mp4"];
  const base = new URL(url).pathname;
  const fileType = base.substring(base.lastIndexOf(".")).toLowerCase();
  const isVideo = videoFileTypes.includes(fileType);
  return isVideo;
};

// Checks if a url is from the ASSETS_URL
const isAssetURL = (url: string): boolean => {
  return url.startsWith(ASSETS_URL);
};

// Gets the Amazon S3 url for new Github assets urls
const fetchRedirectUrl = async (url: string): Promise<string | null> => {
  if (!url.startsWith(ASSETS_URL)) {
    return url;
  }

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
            resolve(responseUrl);
          } else {
            console.error(
              `Error fetching URL: ${url}. Status: ${statusCode} - ${statusMessage}`
            );

            resolve(null);
          }

          response.on("data", () => {});
        }
      )
      .on("error", (err) => {
        console.error("Failed to fetch the redirect URL:", err.message);
        resolve(null);
      });
  });
};

cloudinary.config({
  secure: true,
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const fetchAssetDetailsFromCloudinary = async (
  publicId: string,
  type: "image" | "video"
): Promise<null | { url: string; width: number; height: number }> => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: type,
    });
    if (result) {
      return {
        url: result.secure_url,
        width: result.width,
        height: result.height,
      };
    }
    return null;
  } catch (error) {
    // If error is 'not found', return null, otherwise log the error
    // if (error.http_code === 404) return null;
    console.error("Error fetching Cloudinary details:", error, publicId, type);
    return null;
  }
};

// Uploads images and videos to cloudinary during the build
const uploadToCloudinary = async (url: string, type: "image" | "video") => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      resource_type: type,
      format: type === "image" ? "webp" : "auto",
      eager: [
        {
          quality: "auto",
          width: 500,
          crop: "limit",
        },
      ],
    });
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", { error, url, type });
    return null;
  }
};

// Finds urls in the markdown content
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
    if (href.match(/\.(jpeg|jpg|gif|png)$/i) || isAssetURL(href)) {
      urls.push(href);
    }
    return href;
  };

  marked.use({ renderer: tempRenderer });
  marked.parse(content);
  return urls;
};

// Loops through all urls, works out if they're an image or a video. Uploads images and videos to Cloudinary.
await createEmptyJSONFileIfNotExists("assetsUploadRecord.json");

let assetsCacheJSON = await readJSONFile("assetsUploadRecord.json");
const assetsCacheEmpty: boolean =
  !assetsCacheJSON || assetsCacheJSON.length === 0;

let assetsCache = assetsCacheJSON.allAssetDetails || {};
if (assetsCacheEmpty) {
  await writeJSONFile("assetsUploadRecord.json", { allAssetDetails: {} });
  assetsCache = await readJSONFile("assetsUploadRecord.json").allAssetDetails;
}

type AssetDetails = {
  original_url: string;
  url: string;
  width: number;
  height: number;
};

const allAssetDetails: AssetDetails[] = [];

const processUrls = async (urls: string[]) => {
  for (const url of urls) {
    let assetRecord = assetsCache[url];

    if (assetRecord) {
      if (
        !allAssetDetails.some(
          (asset) => asset.original_url === assetRecord.original_url
        )
      ) {
        allAssetDetails.push(assetRecord);
      }
      continue;
    } else {
      // Fetch the finalUrl
      const finalUrl = await fetchRedirectUrl(url);
      if (!finalUrl) {
        console.error("Final URL not found for: ", url);
        continue;
      }

      const assetType = isURLVideo(finalUrl) ? "video" : "image";

      const cloudinaryResponse = await uploadToCloudinary(finalUrl, assetType);

      if (cloudinaryResponse) {
        const newAssetDetail = {
          original_url: url,
          url: cloudinaryResponse.eager[0].secure_url,
          width: cloudinaryResponse.eager[0].width,
          height: cloudinaryResponse.eager[0].height,
        };

        allAssetDetails.push(newAssetDetail);
        assetsCache[url] = newAssetDetail;
      }

      await writeJSONFile("assetsUploadRecord.json", {
        allAssetDetails: assetsCache,
      });
    }
  }

  return allAssetDetails;
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
  const processedAssets = await processUrls(urls);

  renderer.link = (href, title, text) => {
    const transformedAsset = processedAssets.find(
      (asset) => asset.original_url === href
    );

    if (
      isURLVideo(href) ||
      href.match(/\.(jpeg|jpg|gif|png)$/i) ||
      isAssetURL(href)
    ) {
      if (transformedAsset && isURLVideo(href)) {
        return `<div class="flex justify-center"><video controls muted preload="metadata" class="max-h-72 my-0 border dark:border-gray-500">
              <source src="${transformedAsset.url}" type="video/mp4">
            </video></div>`;
      }
      return `<a href="${href}">${text}</a>`;
    }
    return `<a href="${href}">${text}</a>`;
  };

  renderer.image = (href, title, text) => {
    const transformedAsset = processedAssets.find(
      (asset) => asset.original_url === href
    );

    if (transformedAsset) {
      return `<img src="${transformedAsset.url}" alt="${text}" title="${
        title || ""
      }" width=${transformedAsset.width} height=${transformedAsset.height} />`;
    }
    return `<img src="${href}" alt="${text}" />`;
  };

  marked.use({ renderer });
  return sanitizeHtml(marked.parse(content), sanitizeHTMLOptions);
};
