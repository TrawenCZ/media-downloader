import express from "express";
import dotenv from "dotenv";
import path from "path";
import ip from "ip";
import fs from "fs";
import cors from "cors";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { exit } from "process";
import { initializeApp } from "./utils/init";
import { mainRouter } from "./routes/mainRouter";
import { refreshStatuses } from "./utils/helpers";


dotenv.config();
export const IPADDRESS = ip.address();
export const PORT = process.env?.PORT || 3000;

const app = initializeApp();

AppDataSource.initialize().then(async () => {

  app.use("/api", mainRouter);

  app.get("/", refreshStatuses, (req, res) => {
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

  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${PORT}`);
  });

});
