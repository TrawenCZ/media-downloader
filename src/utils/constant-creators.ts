import path from "path";
import fs from "fs";
import { exit } from "process";
import dotenv from "dotenv";

dotenv.config();

export const createFileOutputPath = () => {
  var fileOutputPathRaw =
    process.env.NODE_ENV === "development"
      ? process.env.FILE_OUTPUT_PATH_TEST
      : process.env.FILE_OUTPUT_PATH;
  fileOutputPathRaw = fileOutputPathRaw.startsWith("/")
    ? fileOutputPathRaw
    : path.join(__dirname, "..", "..", fileOutputPathRaw);
  const fileOutputPathRawDirContent = fs
    .readdirSync(fileOutputPathRaw)
    .filter((entry) =>
      fs.statSync(fileOutputPathRaw + "/" + entry).isDirectory()
    );
  if (fileOutputPathRawDirContent.length === 0) {
    console.log(
      `Please create at least one directory in "${fileOutputPathRaw}" to store downloaded files.`
    );
    return "";
  }

  return path.join(fileOutputPathRaw, fileOutputPathRawDirContent[0]);
};

export const createQueueFilePath = () => {
  const queueFilePathRaw =
    process.env.NODE_ENV === "development"
      ? process.env.QUEUE_FILE_PATH_TEST
      : process.env.QUEUE_FILE_PATH;

  return queueFilePathRaw.startsWith("/")
    ? queueFilePathRaw
    : path.join(__dirname, "..", "..", queueFilePathRaw);
};
