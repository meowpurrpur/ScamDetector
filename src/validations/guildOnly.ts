import {
  ApplicationCommandTypes,
  CommandInteraction,
  MessageFlags,
} from "oceanic.js";

export async function guildOnly(
  interaction: CommandInteraction<any, ApplicationCommandTypes.CHAT_INPUT>,
) {
  if (interaction.guildID) {
    return true;
  }

  await interaction.reply({
    content: "this command can only be used in servers.",
    flags: MessageFlags.EPHEMERAL,
  });

  return false;
}
