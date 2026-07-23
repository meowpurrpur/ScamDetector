import { pathToFileURL } from "node:url";
import { CreateApplicationCommandOptions } from "oceanic.js";
import { readFilesRecursive } from "../lib/utils";
import { CommandContext, CommandOption, Validation } from "../framework/types";

export type Command = {
  data: CreateApplicationCommandOptions;

  options?: CommandOption[];
  validations?: Validation[];

  execute(interaction: CommandContext): Promise<void>;
};

export async function loadCommands(): Promise<Record<string, Command>> {
  const commandsPath = __dirname;
  const commands: Record<string, Command> = {};

  const files = readFilesRecursive(commandsPath).filter(
    (file) =>
      (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".js")) &&
      !file.endsWith("index.ts") &&
      !file.endsWith("index.js"),
  );

  for (const file of files) {
    const imported = await import(pathToFileURL(file).href);
    let command = imported.default ?? imported;

    if ("default" in command) {
      command = command.default;
    }

    commands[command.data.name] = command;
  }

  return commands;
}
