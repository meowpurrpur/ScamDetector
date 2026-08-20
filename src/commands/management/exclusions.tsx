import { guildOnly } from "../../validations/guildOnly";
import { defineCommand } from "../../framework/commands";
import { adminOnly } from "../../validations/adminOnly";
import {
  ChannelOption,
  MentionableOption,
  StringOption,
} from "../../components/options";
import db, {
  addGuildExclusion,
  getGuildConfig,
  getGuildExclusions,
  removeGuildExclusion,
} from "../../lib/db";
import { MessageFlags } from "oceanic.js";
import consola from "consola";

export default defineCommand({
  name: "exclusion",
  description: "Manage the excluded roles, channels and users.",

  validations: [guildOnly, adminOnly],
  options: [
    <StringOption
      name="action"
      description="Add, remove or list"
      choices={["add", "remove", "list"]}
      required
    />,
    <MentionableOption
      name="user_or_role"
      description="The user / role to be excluded"
    />,
    <ChannelOption name="channel" description="The channel to be excluded" />,
  ],

  async execute(interaction) {
    if (!interaction.guild) return;

    const options = interaction.data.options;
    const action = options.getString("action");
    const mentionable = options.getMentionable("user_or_role");
    const channel = options.getChannel("channel");

    if (action === "list") {
      const exclusions = getGuildExclusions(interaction.guild.id);

      return interaction.reply({
        content:
          exclusions
            .map(({ id, type }) =>
              type === "channel"
                ? `- <#${id}>`
                : type === "role"
                  ? `- <@&${id}>`
                  : `- <@${id}>`,
            )
            .join("\n") || "There are no exclusions.",
        allowedMentions: {
          everyone: false,
          roles: false,
          users: false,
        },
        flags: MessageFlags.EPHEMERAL,
      });
    }

    if (!channel && !mentionable) {
      return interaction.reply({
        content: "You must specify a channel, user or role.",
        flags: MessageFlags.EPHEMERAL,
      });
    }

    if (channel && mentionable) {
      return interaction.reply({
        content: "You can only specify one target.",
        flags: MessageFlags.EPHEMERAL,
      });
    }

    const target = channel ?? mentionable!;
    const type = channel
      ? "channel"
      : interaction.guild.roles.has(mentionable!.id)
        ? "role"
        : "user";

    const exclusions = getGuildExclusions(interaction.guild.id);
    const exists = exclusions.some((exclusion) => exclusion.id === target.id);

    try {
      switch (action) {
        case "add":
          if (exists) {
            return interaction.reply({
              content: "An exclusion for this already exists.",
            });
          }

          addGuildExclusion({
            id: target.id,
            guildId: interaction.guild.id,
            type,
            createdBy: interaction.user.id,
          });

          return interaction.reply({
            content: "Exclusion added.",
            flags: MessageFlags.EPHEMERAL,
          });

        case "remove":
          if (!exists) {
            return interaction.reply({
              content: "There is no exclusion for that.",
              flags: MessageFlags.EPHEMERAL,
            });
          }

          removeGuildExclusion(interaction.guild.id, target.id);
          return interaction.reply({
            content: "Exclusion removed.",
            flags: MessageFlags.EPHEMERAL,
          });
      }
    } catch (err) {
      consola.error(err);
      return interaction.reply({
        content: "Something went wrong",
        flags: MessageFlags.EPHEMERAL,
      });
    }
  },
});
