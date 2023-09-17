import { Router } from "express";
import { checkPayload, syntetizeLogPath } from "../utils/helpers";
import { AppDataSource } from "../data-source";
import { DownloadEntry } from "../entity/DownloadEntry";
import fs from "fs";
import path from "path";
import { exec, execSync } from "child_process";
import {
  FILE_OUTPUT_PATH,
  QUEUE_FILE_PATH,
  SPEEL_LIMIT_RATE,
} from "../utils/constants";

export const mainRouter = Router();
const downloadRepository = AppDataSource.getRepository(DownloadEntry);

mainRouter.get("/downloads", async (req, res) => {
  res.send(await downloadRepository.find());
});

mainRouter.post("/now", async (req, res) => {
  const link: string = req.body.link;
  const fileOriginalName = link.split("/").pop();
  const aliasName: string = req.body.aliasName || fileOriginalName;

  const { valid, err_msg } = checkPayload(link, aliasName);
  if (!valid) {
    res.status(400).send(err_msg);
    return;
  }

  if (await downloadRepository.findOneBy({ fileName: fileOriginalName })) {
    res.status(400).send("File is already active.");
    return;
  }

  try {
    execSync(`wget -q --spider "${link}"`, { stdio: "inherit" });

    exec(
      `wget ${SPEEL_LIMIT_RATE} -o "${syntetizeLogPath(
        fileOriginalName
      )}" -O "${aliasName + ".mkv"}" "${link}"`,
      { cwd: FILE_OUTPUT_PATH }
    );

    await downloadRepository.insert({
      fileName: fileOriginalName,
      aliasName: aliasName,
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "Internal error occurred while trying to download file '" +
          aliasName +
          "'."
      );
    return;
  }
  res.send("Successfuly downloading file from link '" + link + "'.");
});

mainRouter.post("/queue", async (req, res) => {
  const link = req.body.link;
  const fileOriginalName = link.split("/").pop();
  const aliasName = req.body.aliasName || fileOriginalName;

  const { valid, err_msg } = checkPayload(link, aliasName);
  if (!valid) {
    res.status(400).send(err_msg);
    return;
  }

  if (await downloadRepository.findOneBy({ fileName: fileOriginalName })) {
    res.status(400).send("File is already active.");
    return;
  }

  try {
    execSync(`wget -q --spider "${link}"`, {
      stdio: "inherit",
      cwd: FILE_OUTPUT_PATH,
    });

    fs.appendFileSync(QUEUE_FILE_PATH, `${link}"${aliasName}\n`, {
      encoding: "utf-8",
    });

    await downloadRepository.insert({
      fileName: fileOriginalName,
      aliasName: aliasName,
      isQueued: true,
    });
  } catch (error) {
    res
      .status(500)
      .send(
        "Internal error occurred while trying to put '" +
          aliasName +
          "' into queue (it may be invalid link)."
      );
    return;
  }

  res.send(`Successfuly added "${aliasName}" to queue.`);
});

mainRouter.delete("/downloads/:fileId", async (req, res) => {
  const fileId = req.params.fileId;
  const fileToDelete = await downloadRepository.findOneBy({ id: fileId });

  if (!fileToDelete) {
    res.status(400).send(`File with ID "${fileId}" was not found.`);
    return;
  }

  if (fileToDelete.isQueued) {
    try {
      const data = fs.readFileSync(QUEUE_FILE_PATH, "utf-8");
      const newQueueFileData = data
        .split("\n")
        .filter((x) => x !== "")
        .filter((x) => !x.includes(fileToDelete.fileName))
        .join("\n");

      fs.writeFileSync(QUEUE_FILE_PATH, newQueueFileData, {
        encoding: "utf-8",
      });
    } catch (error) {
      res.status(500).send("Error occurred while deleting file.\n\n" + error);
      return;
    }
  }

  if (!(await downloadRepository.delete({ id: fileId }))) {
    res.status(500).send("Error occurred while deleting file.");
    return;
  }

  if (!fileToDelete.isQueued) {
    try {
      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "storage",
          "progressLogs",
          `${fileToDelete.fileName}.log`
        )
      );

      fs.unlinkSync(
        path.join(
          FILE_OUTPUT_PATH,
          `${
            fileToDelete.aliasName
              ? fileToDelete.aliasName
              : fileToDelete.fileName
          }.mkv`
        )
      );
    } catch (error) {
      res
        .status(500)
        .send(
          "Error occurred while deleting file, but it may be done anyway.\n\n" +
            error
        );
      return;
    }
  }

  res.send("File deleted successfully");
});

mainRouter.post("/downloads/queue-start", async (req, res) => {
  const queueFileData = fs
    .readFileSync(QUEUE_FILE_PATH, "utf-8")
    .split("\n")
    .filter((x) => x !== "");
  if (queueFileData.length === 0) {
    res.status(400).send("Queue is empty.");
    return;
  }

  for (const queueLine of queueFileData) {
    const splittedLine = queueLine.split('"');
    const link = splittedLine[0];
    const fileNoExt = link.split("/").pop();
    const aliasName = splittedLine[1];

    try {
      execSync(`wget -q --spider "${link}"`, {
        stdio: "inherit",
        cwd: FILE_OUTPUT_PATH,
      });

      exec(
        `wget ${SPEEL_LIMIT_RATE} -o "${syntetizeLogPath(fileNoExt)}" -O "${
          aliasName + ".mkv"
        }" "${link}"`,
        { cwd: FILE_OUTPUT_PATH }
      );

      await downloadRepository.upsert(
        { fileName: fileNoExt, aliasName: aliasName, isQueued: false },
        ["fileName"]
      );
    } catch (error) {
      res
        .status(500)
        .send(
          "Internal error occurred while trying to download file '" +
            aliasName +
            "' from queue."
        );
      return;
    }
  }

  fs.unlinkSync(QUEUE_FILE_PATH);
  res.send("Successfuly downloading all files from queue.");
});
