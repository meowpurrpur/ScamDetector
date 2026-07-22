import { expect, test } from "vitest";
import { readdirSync } from "node:fs";
import { join } from "path";
import { checkText } from "../src/lib/ocr/rules";
import { readTextFromImage } from "../src/lib/ocr/utils";
import consola from "consola";

consola.level = 5;
const datasetPath = join(__dirname, "../tests/datasets");

for (const scamType of readdirSync(datasetPath)) {
  test(`detects known ${scamType} scams`, async () => {
    const folder = join(datasetPath, scamType);

    for (const image of readdirSync(folder)) {
      const text = await readTextFromImage(join(folder, image));
      const result = checkText(text, "ocr");

      consola.debug(`${image}, match:`, result.match ?? "none");
      expect(result.detected).toBe(true);
    }
  }, 60000);
}
