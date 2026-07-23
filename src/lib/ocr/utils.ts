import path from "node:path";
import fs from "node:fs";
import { createWorker, type Worker } from "tesseract.js";
import consola from "consola";

export function extractImageUrls(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex) || [];

  return matches.filter((url) => url.match(/\.(png|jpg|jpeg|webp)(\?|$)/i));
}

export async function downloadImage(url: string): Promise<string | undefined> {
  const maxAttempts = 5;
  const retryMs = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const bufferArray = await response.arrayBuffer();
      const buffer = Buffer.from(bufferArray);

      const filePath = path.join(__dirname, "temp_" + Date.now());
      fs.writeFileSync(filePath, buffer);

      return filePath;
    } catch (err: any) {
      consola.error(
        `Download failed for ${url} (Attempt ${attempt}/${maxAttempts}):`,
        err.message,
      );

      if (attempt === maxAttempts) {
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, retryMs));
    }
  }
}

const workerCount = 4;

let workers: Worker[] = [];
let workerIndex = 0;
let initPromise: Promise<void> | undefined;

async function initWorkers() {
  if (workers.length) return;

  if (!initPromise) {
    initPromise = Promise.all(
      Array.from({ length: workerCount }, async () => {
        const worker = await createWorker("eng");
        await worker.setParameters({
          tessedit_char_whitelist:
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$ ",
        });

        workers.push(worker);
      }),
    ).then(() => undefined);
  }

  await initPromise;
}

export async function readTextFromImage(filePath: string) {
  await initWorkers();

  const worker = workers[workerIndex];
  workerIndex = (workerIndex + 1) % workers.length;

  const result = await worker.recognize(filePath);
  return result.data.text;
}

export async function terminateWorkers() {
  await Promise.all(workers.map((worker) => worker.terminate()));

  workers = [];
}
