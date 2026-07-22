import fs from "node:fs";
import path from "node:path";

export function readFilesRecursive(dir: string): string[] {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  return files.flatMap((file) => {
    const filePath = path.join(dir, file.name);

    if (file.isDirectory()) {
      return readFilesRecursive(filePath);
    }

    return [filePath];
  });
}
