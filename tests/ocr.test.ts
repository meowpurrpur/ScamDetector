import { expect, test, afterAll } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "path";
import { checkContent } from "../src/lib/ocr/rules";
import { readTextFromImage, terminateWorkers } from "../src/lib/ocr/utils";
import consola from "consola";

consola.level = 5;
const datasetPath = join(__dirname, "../tests/datasets");

afterAll(async () => {
  await terminateWorkers();
});

for (const scamType of readdirSync(datasetPath)) {
  const folder = join(datasetPath, scamType);

  for (const image of readdirSync(folder)) {
    test.concurrent(
      `detects ${scamType} scam: ${image}`,
      async () => {
        const text = await readTextFromImage(join(folder, image));
        const result = checkContent(text, "ocr");

        consola.debug(
          `${image}, score: ${result.confidence}, matches:`,
          result.matches.length ?? "none",
        );

        expect(result.detected).toBe(true);
        expect(result.matches.length).toBeGreaterThan(0);
      },
      60000,
    );
  }
}
