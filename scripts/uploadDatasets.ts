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

  const date = new Date()
    .toISOString()
    .replace("T", " ")
    .replace(/\.\d{3}Z$/, " UTC");

  const tag = `datasets-${Date.now()}`;
  const title = `datasets ${date}`;

  const headers = {
    Authorization: `token ${token}`,
  };

  const releaseResponse = await fetch(
    `${baseUrl}/repos/${owner}/${repo}/releases`,
    {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tag_name: tag,
        name: title,
        body: `Dataset release automatically generated on ${date}.`,
        draft: true,
        prerelease: false,
        hide_archive_links: true,
      }),
    },
  );

  if (!releaseResponse.ok) {
    throw new Error(
      `failed to create release: ${releaseResponse.status} ${await releaseResponse.text()}`,
    );
  }

  const release = (await releaseResponse.json()) as {
    id: number;
  };

  consola.success(`created release "${title}"`);

  for (const filename of ["datasets.tar.gz", "datasets.tar.gz.sha256"]) {
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

    const publishResponse = await fetch(
      `${baseUrl}/repos/${owner}/${repo}/releases/${release.id}`,
      {
        method: "PATCH",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draft: false,
        }),
      },
    );

    if (!publishResponse.ok) {
      throw new Error(
        `failed to publish release: ${publishResponse.status} ${await publishResponse.text()}`,
      );
    }

    consola.success(`published release "${title}"`);
  }
}

main();
