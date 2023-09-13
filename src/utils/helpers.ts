import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../data-source";
import { DownloadEntry } from "../entity/DownloadEntry";


const downloadRepository = AppDataSource.getRepository(DownloadEntry);


export const refreshStatuses = async (req, res, next) => {
    var activeFileNames: DownloadEntry[] = [];

    for (const file of fs.readdirSync(
      path.join(__dirname, "..", "storage", "progressLogs")
    )) {
      if (file === ".gitkeep") continue;

      const progressAndRemainingTime = loadProgressAndRemainingTime(file);
      if (progressAndRemainingTime.progress === -1) continue;

      const fileNoExt = file.replace(".log", "");
      if (req.body.aliasName) {
        activeFileNames.push(downloadRepository.create({fileName: fileNoExt, aliasName: req.body.aliasName, progress: progressAndRemainingTime.progress}));
      } else {
        activeFileNames.push(downloadRepository.create({fileName: fileNoExt, progress: progressAndRemainingTime.progress}));
      }

    }

    if (activeFileNames.length > 0) {
        await downloadRepository.upsert(activeFileNames, ["fileName"]);
    }

    await downloadRepository.createQueryBuilder().delete().where("fileName NOT IN (:...fileNames) AND ( isQueued = 0 OR createdAt < DATETIME(DATE(), '+1 day'))", {fileNames: activeFileNames.map((file) => file.fileName)}).execute();

    next()
}


export const loadProgressAndRemainingTime = (fileName) => {
    try {
      const data = execSync(
        "tail -n 3 " +
          path.join(__dirname, "..", "storage", "progressLogs", fileName)
      ).toString();
      return {
        progress: parseInt(
          data
            .split(" ")
            .reverse()
            .find((item) => item.includes("%"))
            .replace("%", "")
        ),
        remainingTime: data.split("\n").at(-2).split(" ").at(-1),
      };
    } catch (error) {
      return { progress: -1, remainingTime: "N/A" };
    }
}