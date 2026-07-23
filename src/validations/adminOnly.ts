import {
  ApplicationCommandTypes,
  CommandInteraction,
  MessageFlags,
} from "oceanic.js";

export async function adminOnly(
  interaction: CommandInteraction<any, ApplicationCommandTypes.CHAT_INPUT>,
) {
  if (interaction.member?.permissions.has("ADMINISTRATOR")) {
    return true;
  }

  await interaction.reply({
    content: "You must have administrator permissions to run this command.",
    flags: MessageFlags.EPHEMERAL,
  });

  return false;
}
