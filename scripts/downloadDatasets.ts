import consola from "consola";
import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { createGunzip } from "node:zlib";
import tar from "tar-fs";

const datasetUrl =
  "https://git.imtheo.lol/theo/ScamDetector/releases/download/latest/datasets.tar.gz";

async function main() {
  const root = process.cwd();
  const archivePath = join(root, ".datasets.tar.gz");
  const tempDir = join(root, ".datasets");

  consola.info(`downloading datasets from ${datasetUrl}...`);
  const response = await fetch(datasetUrl);
  if (!response.ok || !response.body) {
    throw new Error(
      `failed to download dataset: ${response.status} ${response.statusText}`,
    );
  }

  await pipeline(
    response.body as unknown as NodeJS.ReadableStream,
    createWriteStream(archivePath),
  );

  const hashResponse = await fetch(`${datasetUrl}.sha256`);
  if (hashResponse.ok) {
    const expectedHash = (await hashResponse.text()).trim().split(/\s+/)[0];
    const hash = createHash("sha256");

    for await (const chunk of createReadStream(archivePath)) {
      hash.update(chunk);
    }

    const actualHash = hash.digest("hex");
    consola.info(
      `expected hash: ${expectedHash}, downloaded hash: ${actualHash}`,
    );

    if (actualHash !== expectedHash) {
      await rm(archivePath, { force: true });
      throw new Error(
        `dataset checksum mismatch\nexpected: ${expectedHash}\nactual: ${actualHash}`,
      );
    } else {
      consola.success("hash validated");
    }
  }

  await rm(tempDir, { recursive: true, force: true });
  await mkdir(tempDir, { recursive: true });

  await pipeline(
    createReadStream(archivePath),
    createGunzip(),
    tar.extract(tempDir),
  );

  await rm(join(root, "tests/datasets"), {
    recursive: true,
    force: true,
  });

  await rm(join(root, "tests/unknownDatasets"), {
    recursive: true,
    force: true,
  });

  await mkdir(join(root, "tests"), { recursive: true });

  await import("node:fs/promises").then(({ cp }) =>
    Promise.all([
      cp(join(tempDir, "tests/datasets"), join(root, "tests/datasets"), {
        recursive: true,
      }),
      cp(
        join(tempDir, "tests/unknownDatasets"),
        join(root, "tests/unknownDatasets"),
        { recursive: true },
      ),
    ]),
  );

  await rm(tempDir, { recursive: true, force: true });
  await rm(archivePath, { force: true });

  consola.success("datasets updated");
}

main();
