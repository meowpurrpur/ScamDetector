import type {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  CommandInteraction,
} from "oceanic.js";

export type CommandOption = ApplicationCommandOptionTypes;
export type CommandContext = CommandInteraction<
  any,
  ApplicationCommandTypes.CHAT_INPUT
>;

export type Validation = (
  interaction: CommandContext,
) => Promise<boolean> | boolean;
