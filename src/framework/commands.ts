import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  ApplicationCommandOptions,
} from "oceanic.js";
import type { Command } from "../commands";

type DefineCommandOptions = Omit<Command, "data" | "options"> & {
  name: string;
  description: string;
  options?: ApplicationCommandOptions[];
};

export function defineCommand(options: DefineCommandOptions): Command {
  return {
    data: {
      name: options.name,
      description: options.description,
      type: ApplicationCommandTypes.CHAT_INPUT,
      options: options.options,
    },

    options: [],
    validations: options.validations ?? [],
    execute: options.execute,
  };
}
