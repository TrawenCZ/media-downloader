import express from "express";
import dotenv from "dotenv";
import path from "path";
import ip from "ip";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { initializeApp, refreshLoop } from "./utils/init";
import { mainRouter } from "./routes/mainRouter";
import fs from "fs";
import { exit } from "process";



dotenv.config();
export const IPADDRESS = ip.address();
export const PORT = process.env?.PORT || 3000;
export const PYTHON_CMD = process.env?.PYTHON_CMD || "python";

const queueFilePathRaw = process.env.NODE_ENV === "development" ? process.env.QUEUE_FILE_PATH_TEST : process.env.QUEUE_FILE_PATH;
export const QUEUE_FILE_PATH = queueFilePathRaw.startsWith("/") ? queueFilePathRaw : path.join(__dirname, "..", queueFilePathRaw);

var fileOutputPathRaw = process.env.NODE_ENV === "development" ? process.env.FILE_OUTPUT_PATH_TEST : process.env.FILE_OUTPUT_PATH;
fileOutputPathRaw = fileOutputPathRaw.startsWith("/") ? fileOutputPathRaw : path.join(__dirname, "..", fileOutputPathRaw);
const fileOutputPathRawDirContent = fs.readdirSync(fileOutputPathRaw).filter(entry => fs.statSync(fileOutputPathRaw + "/" + entry).isDirectory())
if (fileOutputPathRawDirContent.length === 0) {
  console.log(`Please create at least one directory in "${fileOutputPathRaw}" to store downloaded files.`);
  exit(1);
}
export const FILE_OUTPUT_PATH = path.join(fileOutputPathRaw, fileOutputPathRawDirContent[0]);

export const LOGS_DIR_PATH = path.join(__dirname, "storage", "progressLogs");

export const SPEEL_LIMIT_RATE = process.env.LIMIT_SPEED_RATE ? `--limit-rate=${process.env.LIMIT_SPEED_RATE}` : "";


AppDataSource.initialize().then(async () => {

  const app = initializeApp();

  app.use("/api", mainRouter);

  app.get("/", (req, res) => {
    res.sendFile(
      path.resolve(
        __dirname,
        "..",
        "webshare-downloader-frontend",
        "build",
        "index.html"
      )
    );
  });

  app.use(express.static(path.join(__dirname, '..', 'webshare-downloader-frontend', 'build')));
  
  refreshLoop()

  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${PORT}`);
  });

});
