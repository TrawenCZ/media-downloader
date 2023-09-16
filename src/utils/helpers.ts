import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../data-source";
import { DownloadEntry } from "../entity/DownloadEntry";


const downloadRepository = AppDataSource.getRepository(DownloadEntry);


export const refreshStatuses = async (req, res, next) => {
    var activeFileNames: Partial<DownloadEntry>[] = [];

    for (const file of fs.readdirSync(
      path.join(__dirname, "..", "storage", "progressLogs")
    )) {
      if (file === ".gitkeep") continue;

      const progressAndRemainingTime = loadProgressAndRemainingTime(file);
      if (progressAndRemainingTime.progress === -1) continue;

      const fileNoExt = file.replace(".log", "");
      activeFileNames.push({fileName: fileNoExt, progress: progressAndRemainingTime.progress, remainingTime: progressAndRemainingTime.remainingTime});

    }

    if (activeFileNames.length > 0) {
        await downloadRepository.upsert(activeFileNames, ["fileName"]);
    }

    //await downloadRepository.createQueryBuilder().delete().where("fileName NOT IN (:...fileNames) AND ( isQueued = 0 OR createdAt < DATETIME(DATE(), '-1 day'))", {fileNames: activeFileNames.map((file) => file.fileName)}).execute();

    next()
}


export const loadProgressAndRemainingTime = (fileName) => {
    try {
      const data = execSync(
        "tail -n 4 " +
          path.join(__dirname, "..", "storage", "progressLogs", fileName)
      ).toString();

      const cleanedData = data.split('\n').filter(x => x !== '').join('\n');
      const remainingTimeRaw = cleanedData.split("\n").at(-2).split(" ").at(-1);

      return {
        progress: parseInt(
          cleanedData
            .split(" ")
            .reverse()
            .find((item) => item.includes("%"))
            .replace("%", "")
        ),
        remainingTime: remainingTimeRaw.includes('=') ? `Dokončeno za ${remainingTimeRaw.split('=')[1]}` : remainingTimeRaw,
      };
    } catch (error) {
      return { progress: -1, remainingTime: "N/A" };
    }
}


export const checkPayload = (link, aliasName) => {
    if (link.split(" ").length > 1) {
      return {valid: false, err_msg: "Only one link is allowed."};
    }
  
    if (link.includes(`"`)) {
      return {valid: false, err_msg: "Link cannot contain quotation marks."};
    }

    if (aliasName.includes(`"`) || aliasName.includes(`/`)) {
      return {valid: false, err_msg: "Alias name cannot contain quotation marks and slashes."};
    }
  
    return {valid: true, err_msg: ""};
}