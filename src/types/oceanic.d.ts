import { Collection } from "oceanic.js";
import type { Command } from "../commands";

declare module "oceanic.js" {
  interface Client {
    commands: Collection<string, Command>;
  }
}
