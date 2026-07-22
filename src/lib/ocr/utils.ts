import path from "node:path";
import fs from "node:fs";
import Tesseract from "tesseract.js";
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

export async function readTextFromImage(filePath: string) {
  const result = await Tesseract.recognize(filePath, "eng");
  return result.data.text;
}
