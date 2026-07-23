import {
  CommandInteraction,
  ComponentInteraction,
  type AnyInteractionGateway,
} from "oceanic.js";
import { handleComponentInteraction } from "../framework/interactions";

export const name = "interactionCreate";

export async function execute(interaction: AnyInteractionGateway) {
  if (
    interaction instanceof CommandInteraction &&
    interaction.isChatInputCommand()
  ) {
    const command = interaction.client.commands.get(interaction.data.name);
    if (command) {
      for (const validation of command.validations ?? []) {
        const passed = await validation(interaction);
        if (!passed) {
          return;
        }
      }

      await command.execute(interaction);
    }

    return;
  }

  if (interaction instanceof ComponentInteraction) {
    await handleComponentInteraction(interaction);
    return;
  }
}
