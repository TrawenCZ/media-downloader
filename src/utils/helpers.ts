import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { AppDataSource } from "../data-source";
import { DownloadEntry } from "../entity/DownloadEntry";
import { In, Not } from "typeorm";
import { LOGS_DIR_PATH, QUEUE_FILE_PATH } from "./constants";

const downloadRepository = AppDataSource.getRepository(DownloadEntry);

export const refreshStatuses = async () => {
  const activeDownloadEntries: Partial<DownloadEntry>[] = [];

  for (const file of fs.readdirSync(LOGS_DIR_PATH)) {
    if (file === ".gitkeep" || !file.endsWith(".log")) continue;

    const progressAndRemainingTime = loadProgressAndRemainingTime(file);
    if (progressAndRemainingTime.progress === -1) continue;

    const fileNoExt = file.replace(".log", "");
    activeDownloadEntries.push({
      fileName: fileNoExt,
      progress: progressAndRemainingTime.progress,
      remainingTime: progressAndRemainingTime.remainingTime,
      isQueued: false,
    });
  }

  if (fs.existsSync(QUEUE_FILE_PATH)) {
    for (const queueLine of fs
      .readFileSync(QUEUE_FILE_PATH, "utf-8")
      .split("\n")
      .filter((x) => x !== "")) {
      const splittedLine = queueLine.split('"');
      const fileNoExt = splittedLine[0].split("/").pop();
      const aliasName = splittedLine[1];
      activeDownloadEntries.push({
        fileName: fileNoExt,
        aliasName: aliasName,
        isQueued: true,
      });
    }
  }

  await downloadRepository.upsert(activeDownloadEntries, ["fileName"]);

  await downloadRepository.delete({
    fileName: Not(In(activeDownloadEntries.map((e) => e.fileName))),
  });
};

export const loadProgressAndRemainingTime = (fileName) => {
  try {
    const data = execSync(
      "tail -n 4 " +
        path.join(__dirname, "..", "storage", "progressLogs", fileName)
    ).toString();

    const cleanedData = data
      .split("\n")
      .filter((x) => x !== "")
      .join("\n");
    const remainingTimeRaw = cleanedData.split("\n").at(-2).split(" ").at(-1);

    return {
      progress: parseInt(
        cleanedData
          .split(" ")
          .reverse()
          .find((item) => item.includes("%"))
          .replace("%", "")
      ),
      remainingTime: remainingTimeRaw.includes("=")
        ? `Dokončeno za ${remainingTimeRaw.split("=")[1]}`
        : remainingTimeRaw,
    };
  } catch (error) {
    return { progress: -1, remainingTime: "N/A" };
  }
};

export const checkPayload = (link, aliasName) => {
  if (link.includes(`"`) || aliasName.includes(" ")) {
    return {
      valid: false,
      err_msg: "Link cannot contain quotation marks and spaces.",
    };
  }

  if (
    aliasName.includes(`"`) ||
    aliasName.includes(`/`) ||
    aliasName.includes(" ")
  ) {
    return {
      valid: false,
      err_msg: "Alias name cannot contain quotation marks, slashes and spaces.",
    };
  }

  return { valid: true, err_msg: "" };
};

export const syntetizeLogPath = (fileName) => {
  return path.join(LOGS_DIR_PATH, `${fileName}.log`);
};
