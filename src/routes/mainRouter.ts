import { Router } from 'express';
import { checkPayload, loadProgressAndRemainingTime, refreshStatuses } from '../utils/helpers';
import { AppDataSource } from '../data-source';
import { DownloadEntry } from '../entity/DownloadEntry';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { execSync } from 'child_process';
import { PYTHON_CMD } from '..';


export const mainRouter = Router();
const downloadRepository = AppDataSource.getRepository(DownloadEntry);


mainRouter.get("/downloads", refreshStatuses, async (req, res) => {
    res.send(await downloadRepository.find());
});


mainRouter.post("/now", refreshStatuses, async (req, res) => {
    const link: string = req.body.link;
    const fileOriginalName = link.split("/").pop();
    const aliasName: string = req.body.aliasName || fileOriginalName;

    const {valid, err_msg} = checkPayload(link, aliasName);
    if (!valid) {
      res.status(400).send(err_msg);
      return;
    }


    if (await downloadRepository.findOneBy({fileName: fileOriginalName})) { 
      res.status(400).send("File is already active.");
      return;
    }

    try {

      execSync(`${PYTHON_CMD} download_now.py "${link}" "${aliasName}"`, { stdio: "inherit" })

      await downloadRepository.insert({ fileName: fileOriginalName, aliasName: aliasName});

    } catch (error) {
      res
        .status(500)
        .send("Internal error occurred while trying to download file '" + aliasName + "'.");
      return;
    }
    res.send("Successfuly downloading file from link '" + link + "'.");
});


mainRouter.post("/queue", refreshStatuses, async (req, res) => {
    const link = req.body.link;
    const fileOriginalName = link.split("/").pop();
    const aliasName = req.body.aliasName || fileOriginalName;

    const {valid, err_msg} = checkPayload(link, aliasName);
    if (!valid) {
      res.status(400).send(err_msg);
      return;
    }

    try {
      
      execSync(`${PYTHON_CMD} download_in_queue.py "${link}" "${aliasName}"`, { stdio: "inherit" })

      await downloadRepository.insert({ fileName: fileOriginalName, aliasName: aliasName, isQueued: true});

    } catch (error) {
      res
        .status(500)
        .send("Internal error occurred while trying to put '" + aliasName + "' into queue (it may be invalid link).");
      return;
    }

    res.send(`Successfuly added "${aliasName}" to queue.`);
});


mainRouter.delete("/downloads/:fileId", refreshStatuses, async (req, res) => {
    const fileId = req.params.fileId;
    const fileToDelete = await downloadRepository.findOneBy({id: fileId});

    if (!fileToDelete) {
      res.status(400).send(`File with ID "${fileId}" was not found.`);
      return;
    }

    if (!await downloadRepository.delete({id: fileId})) {
      res.status(500).send("Error occurred while deleting file.");
      return;
    }

    fs.unlinkSync(
      path.join(__dirname, "storage", "progressLogs", `${fileToDelete.fileName}.log`)
    );

    res.send("File deleted successfully");
});