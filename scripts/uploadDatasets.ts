import "dotenv/config";
import consola from "consola";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function main() {
  consola.info("uploading datasets...");

  const root = process.cwd();
  const outputDir = join(root, "dist");

  const token = process.env.FORGEJO_TOKEN;
  if (!token) throw new Error("FORGEJO_TOKEN is not set, cannot upload");

  const baseUrl = "https://git.imtheo.lol/api/v1";
  const owner = "theo";
  const repo = "ScamDetector";
  const tag = "datasets";

  const headers = {
    Authorization: `token ${token}`,
  };

  const releaseResponse = await fetch(
    `${baseUrl}/repos/${owner}/${repo}/releases/tags/${tag}`,
    { headers },
  );

  if (!releaseResponse.ok) {
    throw new Error(
      `failed to fetch release: ${releaseResponse.status} ${await releaseResponse.text()}`,
    );
  }

  const release = (await releaseResponse.json()) as {
    id: number;
    assets: { id: number; name: string }[];
  };

  for (const filename of ["datasets.tar.gz", "datasets.tar.gz.sha256"]) {
    const existingAsset = release.assets.find(
      (asset) => asset.name === filename,
    );

    if (existingAsset) {
      const response = await fetch(
        `${baseUrl}/repos/${owner}/${repo}/releases/${release.id}/assets/${existingAsset.id}`,
        {
          method: "DELETE",
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(
          `failed to delete ${filename}: ${response.status} ${await response.text()}`,
        );
      }

      consola.info(`deleted existing ${filename}`);
    }

    const file = await readFile(join(outputDir, filename));
    const url = new URL(
      `${baseUrl}/repos/${owner}/${repo}/releases/${release.id}/assets`,
    );

    url.searchParams.set("name", filename);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/octet-stream",
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(
        `failed to upload ${filename}: ${response.status} ${await response.text()}`,
      );
    }

    consola.success(`uploaded ${filename}`);
  }
}

main();
