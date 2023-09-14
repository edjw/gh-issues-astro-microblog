import { promises as fsPromises, constants } from "fs";
import type { PathLike } from "fs";

export async function createEmptyJSONFileIfNotExists(filePath: PathLike) {
  try {
    await fsPromises.access(filePath, constants.F_OK);
  } catch (err) {
    if (err.code === "ENOENT") {
      // The file does not exist, create an empty file
      await fsPromises.writeFile(
        filePath,
        JSON.stringify({ allAssetDetails: [] })
      );
      console.log(`File "${filePath}" created.`);
    } else {
      console.error(`Error checking file "${filePath}":`, err);
      throw err;
    }
  }
}

export async function readJSONFile(filename: PathLike) {
  try {
    const fileContents = await fsPromises.readFile(filename, "utf-8");

    try {
      return JSON.parse(fileContents);
    } catch (jsonError) {
      // Handle JSON parsing errors
      console.error(
        `Error parsing JSON data in ${filename}: ${jsonError.message}`
      );
      throw jsonError; // Re-throw the error to propagate it further if needed
    }
  } catch (readError) {
    // Handle any errors while reading the file
    console.error(`Error reading JSON file ${filename}: ${readError.message}`);
    throw readError; // Re-throw the error to propagate it further if needed
  }
}

export async function writeJSONFile(filePath: PathLike, data) {
  try {
    await fsPromises.writeFile(filePath, JSON.stringify(data, null, 2));
    // console.log("JSON file updated successfully.");
  } catch (err) {
    console.error("Error writing to the JSON file:", err);
    // throw err; // You can choose to handle or propagate the error as needed
  }
}
