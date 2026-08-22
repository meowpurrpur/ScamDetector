import consola from "consola";
import fs from "node:fs";
import { AnyTextableGuildChannel, Message } from "oceanic.js";
import {
  Container,
  MediaGallery,
  TextDisplay,
  ComponentMessage,
  MediaGalleryItem,
  Br,
} from "../../components";
import { getGuildConfig } from "../db";
import { removedUsers } from "./shared";

export default async function removeUser(
  message: Message,
  tasks: Task[],
  overallConfidence?: number,
  threshold?: number,
) {
  const user = message.author;
  const guild = message.guild;

  if (removedUsers.has(user.id) || !guild) return;
  const guildConfig = getGuildConfig(guild.id);
  if (!guildConfig) return;

  removedUsers.add(user.id);
  consola.info(`Removing ${user.username} (${user.id})...`);

  try {
    const logChannel = guild.channels.get(
      guildConfig.logChannelId,
    ) as AnyTextableGuildChannel;

    if (!guild || !logChannel)
      throw Error("Guild or log channel was not found");

    const userMessage = (
      <ComponentMessage>
        <Container accentColor={0x5865f2}>
          <TextDisplay>
            {`Hello, **${user.username}**,

Your account has been flagged for possible spam activity or a compromised account and has been removed from \`${guild.name}\`.

If this is a mistake, all you have to do is rejoin the server from the link below.

**To rejoin, please click [here](${guildConfig.inviteLink})**! We hope this will be your first and last warning, please ensure your account is secure and follows the server rules to avoid future punishments.

For guidance on securing your account and avoiding social engineering attacks, we recommend reading [this article](https://discord.com/safety/securing-your-discord-account) from Discord.

Thank you for your understanding.
`}
          </TextDisplay>
        </Container>
      </ComponentMessage>
    );

    try {
      const userChannel = await user.createDM();
      userChannel.createMessage(userMessage);

      consola.info("Sent DM to user");
    } catch (_) {
      consola.info("Failed to send DM to user");
    }

    const member = await guild.getMember(user.id);
    if (!member) throw Error("Failed to find guild member");

    if (process.env.DEBUG_MODE !== "true") {
      await guild.createBan(user.id, {
        reason: "Compromised account (softban)",
        deleteMessageSeconds: 60 * 60 * 24,
      });

      consola.info("Member banned and recent messages deleted");
    }

    const taskDetails = tasks
      .map((t, i) => {
        if (!t.results) {
          return `### Task ${i + 1} (${t.type})
**Source:** ${t.type}
**Result:** No result`;
        }

        const { ocr, image, text } = t.results;
        const matches: string[] = [
          ...(ocr?.rules?.map((rule) => `\`${rule.pattern.source}\``) ?? []),
          ...(text?.rules?.map((rule) => `\`${rule.pattern.source}\``) ?? []),
          ...(image
            ? [
                `\`${image.type}/${image.name}\` (${(image.similarity * 100).toFixed(1)}%)`,
              ]
            : []),
        ];

        const lines = [
          `### ${t.type === "text" ? `Text Task ${i + 1}` : `Image Task ${i + 1}`} (${t.type})`,
          `**Confidence:** ${t.confidence ?? 0}%`,
          `**Flagged:** ${t.detected ? "Yes" : "No"}`,
        ];

        if (ocr) {
          lines.push(`**OCR Confidence:** ${ocr.confidence ?? 0}%`);
        }

        if (text) {
          lines.push(`**Text Confidence:** ${text.confidence ?? 0}%`);
        }

        if (t.type !== "text") {
          lines.push(
            `**Image Similarity:** ${
              image
                ? `${(image.similarity * 100).toFixed(1)}%`
                : "None (0%)"
            }`,
          );
        }

        lines.push(
          `**Matches:** ${matches.length ? matches.join(", ") : "None"}`,
        );

        return lines.join("\n");
      })
      .join("\n\n");

    const trimmedTaskDetails =
      taskDetails.length > 3500
        ? `${taskDetails.slice(0, 3497)}...`
        : taskDetails;

    const files = tasks
      .filter((task) => task.filePath)
      .map((task, index) => ({
        name: `image-${index + 1}.png`,
        contents: fs.readFileSync(task.filePath!),
      }));

    const logEmbed = (
      <ComponentMessage files={files}>
        <Container accentColor={0x5865f2}>
          <TextDisplay># Member removed</TextDisplay>
          <TextDisplay>
            {user.mention} ({user.id}) has been softbanned
          </TextDisplay>
          <TextDisplay>
            {`**Confidence:** ${overallConfidence ?? 0}%`}
          </TextDisplay>

          <TextDisplay>
            ## Detection Details
            <Br />
            {trimmedTaskDetails}
          </TextDisplay>

          <MediaGallery>
            {tasks
              .filter((task) => task.filePath && task.results)
              .map((_, index) => (
                <MediaGalleryItem
                  url={`attachment://image-${index + 1}.png`}
                  description={`Task ${index + 1}`}
                  spoiler
                />
              ))}
          </MediaGallery>
        </Container>
      </ComponentMessage>
    );

    try {
      await logChannel.createMessage(logEmbed);
      consola.info("Log has been sent");
    } catch (err) {
      consola.log("Failed to send log", err);
    }

    for (const task of tasks) {
      if (!task.filePath) continue;

      try {
        fs.unlinkSync(task.filePath);
      } catch (err) {
        consola.error(`Failed to delete ${task.filePath}:`, err);
      }
    }

    if (process.env.DEBUG_MODE !== "true") {
      try {
        await guild.removeBan(user.id, "Softban (compromised account)");
        consola.info("Member unbanned (softban complete)");
      } catch (err) {
        consola.error("Failed to unban member after softban:", err);
      }
    }

    removedUsers.delete(user.id);
  } catch (err: any) {
    removedUsers.delete(user.id);
    consola.error("Error removing user:", err);
  }
}
