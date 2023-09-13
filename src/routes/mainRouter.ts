import { Router } from 'express';
import { loadProgressAndRemainingTime, refreshStatuses } from '../utils/helpers';
import { AppDataSource } from '../data-source';
import { DownloadEntry } from '../entity/DownloadEntry';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';


export const mainRouter = Router();
const downloadRepository = AppDataSource.getRepository(DownloadEntry);


mainRouter.get("/api/downloads", refreshStatuses, (req, res) => {
    res.send(downloadRepository.find());
});


mainRouter.post("/api/now", async (req, res) => {
    const link = req.body.link;
    const fileOriginalName = link.split("/").pop();
    const aliasName: string = req.body.aliasName || fileOriginalName;

    if (link.split().length > 1) {
      res.status(400).send("Only one link is allowed.");
      return;
    }

    if (await downloadRepository.findOneBy({fileName: fileOriginalName})) { 
      res.status(400).send("File is already active.");
      return;
    }

    try {
      execSync("python download_now.py " + link, { stdio: "inherit" });
      const newEntry = await downloadRepository.create({ fileName: fileOriginalName, aliasName: aliasName});
      downloadRepository.insert(newEntry)
    } catch (error) {
      res
        .status(500)
        .send("Error occurred while downloading file from link '" + link + "'.");
      return;
    }
    res.send("Successfuly downloading file from link '" + link + "'.");
});


mainRouter.post("/api/queue", async (req, res) => {
    const link = req.body.link;
    const fileOriginalName = link.split("/").pop();
    const aliasName = req.body.aliasName || fileOriginalName;
    if (link.split().length > 1) {
      res.status(400).send("Only one link is allowed.");
      return;
    }
    try {
      execSync("python download_in_queue.py " + link, { stdio: "inherit" });
      const newEntry = await downloadRepository.create({ fileName: fileOriginalName, aliasName: aliasName, isQueued: true});
      downloadRepository.insert(newEntry)
    } catch (error) {
      res
        .status(500)
        .send("Error occurred while putting '" + aliasName + "' into queue.");
      return;
    }
    res.send("Successfuly added to queue '" + aliasName + "'.");
});


mainRouter.delete("/api/downloads/:fileName", async (req, res) => {
    const fileName = req.params.fileName;
    await downloadRepository.delete({fileName: fileName});
    fs.unlinkSync(
      path.join(__dirname, "storage", "progressLogs", `${fileName}.log`)
    );

    res.send("File deleted successfully");
});