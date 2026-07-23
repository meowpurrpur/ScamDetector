import { guildOnly } from "../validations/guildOnly";
import { defineCommand } from "../framework/commands";
import { adminOnly } from "../validations/adminOnly";
import { ChannelOption, StringOption } from "../components/options";
import db, { getGuildConfig } from "../lib/db";
import { MessageFlags } from "oceanic.js";

export default defineCommand({
  name: "config",
  description: "Configure the bot for your server.",

  validations: [guildOnly, adminOnly],
  options: [
    <ChannelOption
      name="log-channel"
      description="The channel to log events in"
      required
    />,
    <StringOption
      name="invite-link"
      description="The invite link to your server"
      required
    />,
  ],

  async execute(interaction) {
    const options = interaction.data.options;

    const logChannel = options.getChannel("log-channel");
    const inviteLink = options.getString("invite-link");

    const permissions = logChannel!.appPermissions;
    if (!permissions.has("SEND_MESSAGES")) {
      await interaction.reply({
        content:
          "The bot don't have permission to send messages in the specified log channel.",
        flags: MessageFlags.EPHEMERAL,
      });

      return;
    }

    const guildId = interaction.guild!.id;
    const guildConfig = getGuildConfig(guildId);

    if (guildConfig) {
      db.prepare(
        "UPDATE guildConfig SET logChannelId = ?, inviteLink = ? WHERE guildId = ?",
      ).run(logChannel?.id, inviteLink, guildId);
    } else {
      db.prepare(
        "INSERT INTO guildConfig (guildId, logChannelId, inviteLink) VALUES (?, ?, ?)",
      ).run(guildId, logChannel?.id, inviteLink);
    }

    await interaction.reply({
      content: "Config has been updated!",
      flags: MessageFlags.EPHEMERAL,
    });
  },
});
