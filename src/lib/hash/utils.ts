import { readFile } from "node:fs/promises";
import { imageHash } from "image-hash";

export interface KnownHash {
  type: string;
  name: string;
  hash: string;
}

export interface Match {
  type: string;
  name: string;
  distance: number;
  similarity: number;
}

let hashes: KnownHash[] | undefined;
function getHash(imagePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    imageHash(imagePath, 16, true, (error: Error | null, hash: string) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(hash);
    });
  });
}

function hammingDistance(a: string, b: string) {
  if (a.length !== b.length) {
    throw new Error("hashes must have the same length");
  }

  let distance = 0;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      distance++;
    }
  }

  return distance;
}

function hashSimilarity(a: string, b: string) {
  return 1 - hammingDistance(a, b) / a.length;
}

async function loadHashes(): Promise<KnownHash[]> {
  if (hashes) return hashes;

  const data = JSON.parse(await readFile("./src/data/hashes.json", "utf8"));

  hashes = Object.entries(data).flatMap(([type, hashes]) =>
    Object.entries(hashes as Record<string, string>).map(([name, hash]) => ({
      type,
      name,
      hash,
    })),
  );

  return hashes;
}

export async function checkImage(
  imagePath: string,
  threshold = 0.85,
): Promise<Match | null> {
  const knownHashes = await loadHashes();
  const hash = await getHash(imagePath);

  let bestMatch: Match | null = null;

  for (const image of knownHashes) {
    const distance = hammingDistance(hash, image.hash);
    const similarity = hashSimilarity(hash, image.hash);

    if (!bestMatch || distance < bestMatch.distance) {
      bestMatch = {
        type: image.type,
        name: image.name,
        distance,
        similarity,
      };
    }
  }

  if (!bestMatch || bestMatch.similarity < threshold) {
    return null;
  }

  return bestMatch;
}
