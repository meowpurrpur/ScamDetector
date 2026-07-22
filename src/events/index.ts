import type { ClientEvents } from "oceanic.js";
import { pathToFileURL } from "node:url";
import { readFilesRecursive } from "../lib/utils";

export type Event = {
  name: keyof ClientEvents;
  once?: boolean;
  execute: (...args: any[]) => any;
};

export async function loadEvents(): Promise<Event[]> {
  const eventsPath = __dirname;

  const files = readFilesRecursive(eventsPath).filter(
    (file) =>
      (file.endsWith(".ts") || file.endsWith(".js")) &&
      !file.endsWith("index.ts") &&
      !file.endsWith("index.js"),
  );

  return Promise.all(
    files.map(async (file) => {
      const event = await import(pathToFileURL(file).href);
      return event.default ?? event;
    }),
  );
}
