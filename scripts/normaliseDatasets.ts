import consola from "consola";
import { randomUUID } from "node:crypto";
import { readdir, rename } from "node:fs/promises";
import { extname, join } from "node:path";

async function normaliseDirectory(directory: string) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile());
  const directories = entries.filter((entry) => entry.isDirectory());

  const temporaryNames = files.map((entry) => ({
    tempPath: join(directory, `.${randomUUID()}.tmp`),
    extension: extname(entry.name),
  }));

  for (let i = 0; i < files.length; i++) {
    await rename(join(directory, files[i].name), temporaryNames[i].tempPath);
  }

  for (let i = 0; i < temporaryNames.length; i++) {
    await rename(
      temporaryNames[i].tempPath,
      join(directory, `sample${i + 1}${temporaryNames[i].extension}`),
    );
  }

  for (const entry of directories) {
    await normaliseDirectory(join(directory, entry.name));
  }
}

async function main() {
  const root = process.cwd();

  await normaliseDirectory(join(root, "tests/datasets"));
  await normaliseDirectory(join(root, "tests/unknownDatasets"));
}

main();
