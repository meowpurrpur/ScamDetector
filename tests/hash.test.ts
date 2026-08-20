import { expect, test } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { checkImage } from "../src/lib/hash/utils";
import consola from "consola";

consola.level = 5;
const datasetPath = join(__dirname, "../tests/unknownDatasets");

const results: {
  scamType: string;
  image: string;
  detected: boolean;
}[] = [];

const tests: Promise<void>[] = [];
for (const scamType of readdirSync(datasetPath)) {
  const folder = join(datasetPath, scamType);

  for (const image of readdirSync(folder)) {
    tests.push(
      (async () => {
        const match = await checkImage(join(folder, image));

        results.push({
          scamType,
          image,
          detected: match !== null,
        });

        consola.debug(
          `${scamType}/${image}, detected: ${match !== null}, match: ${match?.name ?? "none"}, similarity: ${match?.similarity.toFixed(3) ?? "none"}`,
        );
      })(),
    );
  }
}

test("detects at least 80% of unknown scam images by hash", async () => {
  await Promise.all(tests);

  const total = results.length;
  const detected = results.filter((result) => result.detected).length;
  const detectionPercentage = total > 0 ? (detected / total) * 100 : 0;

  consola.info(
    `hash dataset: ${detected}/${total} detected (${detectionPercentage.toFixed(1)}%)`,
  );

  expect(total).toBeGreaterThan(0);
  expect(detectionPercentage).toBeGreaterThanOrEqual(80);
}, 120000);
