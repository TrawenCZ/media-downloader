import path from "path";
import dotenv from "dotenv";
import { createFileOutputPath, createQueueFilePath } from "./constant-creators";

dotenv.config();

export const QUEUE_FILE_PATH = createQueueFilePath();

export const FILE_OUTPUT_PATH = createFileOutputPath();

export const LOGS_DIR_PATH = path.join(
  __dirname,
  "..",
  "storage",
  "progressLogs"
);

export const SPEEL_LIMIT_RATE = process.env.LIMIT_SPEED_RATE
  ? `--limit-rate=${process.env.LIMIT_SPEED_RATE}`
  : "";

export const PORT = process.env?.PORT || 3000;
export const PYTHON_CMD = process.env?.PYTHON_CMD || "python";
