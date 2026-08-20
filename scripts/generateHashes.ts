import { readdir, mkdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
import { imageHash } from "image-hash";
import consola from "consola";

function getHash(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    imageHash(imagePath, 16, true, (error: unknown, hash: string) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(hash);
    });
  });
}

async function main() {
  const datasetDirectory = "./tests/datasets";
  const outputFile = "./src/data/hashes.json";
  const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

  const categories = await readdir(datasetDirectory, {
    withFileTypes: true,
  });

  const hashes: Record<string, Record<string, string>> = {};

  for (const category of categories) {
    if (!category.isDirectory()) {
      continue;
    }

    const categoryDirectory = join(datasetDirectory, category.name);
    const files = (await readdir(categoryDirectory))
      .filter((file) => supportedExtensions.has(extname(file).toLowerCase()))
      .sort();

    hashes[category.name] = {};

    for (const file of files) {
      const path = join(categoryDirectory, file);
      hashes[category.name][file] = await getHash(path);

      consola.info(`hashed ${category.name}/${file}`);
    }
  }

  await mkdir("./src/data", { recursive: true });
  await writeFile(outputFile, JSON.stringify(hashes, null, 2) + "\n");

  const count = Object.values(hashes).reduce(
    (total, category) => total + Object.keys(category).length,
    0,
  );

  consola.info(`generated ${count} hashes`);
  consola.success(`written to ${outputFile}`);
}

main();
