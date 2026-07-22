import type {
  ApplicationCommandOptionTypes,
  CommandInteraction,
} from "oceanic.js";

export type CommandOption = ApplicationCommandOptionTypes;

export type Validation = (
  interaction: CommandInteraction,
) => boolean | Promise<boolean>;
