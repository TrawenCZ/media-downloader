import express from "express";
import dotenv from "dotenv";
import path from "path";
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { initializeApp, refreshLoop } from "./utils/init";
import { mainRouter } from "./routes/mainRouter";
import { PORT } from "./utils/constants";

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

  app.use(
    express.static(
      path.join(__dirname, "..", "webshare-downloader-frontend", "build")
    )
  );

  refreshLoop();

  app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at ${PORT}`);
  });
});
