import consola from "consola";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import tar from "tar-fs";

async function main() {
  const root = process.cwd();
  const outputDir = join(root, "dist");
  const archivePath = join(outputDir, "datasets.tar.gz");

  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  await pipeline(
    tar.pack(root, {
      entries: ["tests/datasets", "tests/unknownDatasets"],
    }),
    createGzip({ level: 9 }),
    createWriteStream(archivePath),
  );

  const hash = createHash("sha256");
  for await (const chunk of createReadStream(archivePath)) {
    hash.update(chunk);
  }

  await writeFile(
    `${archivePath}.sha256`,
    `${hash.digest("hex")} datasets.tar.gz\n`,
  );

  consola.success(`created ${archivePath}`);
}

main();
