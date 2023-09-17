import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { refreshStatuses } from "./helpers";



export const initializeApp = () => {
    
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    if (
      !fs.existsSync(
        path.join(__dirname, "..", "..", "webshare-downloader-frontend", "build")
      )
    ) {
      console.log(
        "Please build frontend first, by running 'npm run build' in webshare-downloader-frontend folder."
      );
      throw new Error("Frontend not built.");
    }

    app.use(
        express.static(
          path.join(__dirname, "..", "webshare-downloader-frontend", "build")
        )
    );

    app.use(cors());

    return app;
}


export const refreshLoop = async () => {
  setTimeout(async () => {
    await refreshStatuses()
    refreshLoop()
  }, 4000)
}