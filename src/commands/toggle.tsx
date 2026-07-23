import { guildOnly } from "../validations/guildOnly";
import { defineCommand } from "../framework/commands";
import { adminOnly } from "../validations/adminOnly";
import { BooleanOption } from "../components/options";
import db, { getGuildConfig } from "../lib/db";
import { MessageFlags } from "oceanic.js";

export default defineCommand({
  name: "toggle",
  description: "Enables/disables scam detection.",

  validations: [guildOnly, adminOnly],
  options: [
    <BooleanOption
      name="enabled"
      description="Scam detection state"
      required
    />,
  ],

  async execute(interaction) {
    const options = interaction.data.options;
    const enabled = options.getBoolean("enabled");

    const guildId = interaction.guild!.id;
    const guildConfig = getGuildConfig(guildId);

    if (guildConfig) {
      db.prepare("UPDATE guildConfig SET enabled = ? WHERE guildId = ?").run(
        Number(enabled),
        guildId,
      );

      await interaction.reply({
        content: `Scam detection has been ${enabled ? "enabled" : "disabled"}!`,
        flags: MessageFlags.EPHEMERAL,
      });
    } else {
      await interaction.reply({
        content:
          "There is no configuration for this server, you cannot use this command, you can set the bot up by running /config.",
        flags: MessageFlags.EPHEMERAL,
      });
    }
  },
});
