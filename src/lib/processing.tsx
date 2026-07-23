import consola from "consola";
import fs from "node:fs";
import { AnyTextableGuildChannel, ChannelTypes, Message } from "oceanic.js";
import {
  downloadImage,
  extractImageUrls,
  readTextFromImage,
} from "./ocr/utils";
import { checkContent } from "./ocr/rules";
import {
  Container,
  MediaGallery,
  TextDisplay,
  ComponentMessage,
  MediaGalleryItem,
  Br,
} from "../components";
import { getGuildConfig } from "./db";

export const processingUsers = new Set<string>();
export const removedUsers = new Set<string>();

type Task = {
  type: "url" | "attachment";
  value: string;
  result?: Result;
  filePath?: string;
};

async function removeUser(message: Message, tasks: Task[]) {
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

**To rejoin, please click [here](${guildConfig.inviteLink})**! We hope this will be your first and last warning, please ensure your account is secure and follows the server rules to avoid future bans.

For guidance on securing your account and avoiding social engineering attacks, we recommend reading [this article](https://discord.com/safety/securing-your-discord-account) from Discord.

Thank you for your understanding,
*${guild.name}*`}
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

    await member.kick("Comprimised account");
    consola.info("Member removed from the server");

    const taskDetails = tasks
      .map((t, i) => {
        if (!t.result) {
          return `### Task ${i + 1}
**Source:** ${t.type}
**Result:** No result`;
        }

        return `### Image ${i + 1}
**Source:** ${t.type}
**Flagged:** ${t.result.detected ? "Yes" : "No"}
**Confidence:** ${t.result.confidence}%
**Matches:** ${
          t.result.matches.length > 0
            ? t.result.matches.map((m) => `\`${m.source}\``).join(", ")
            : "None"
        }`;
      })
      .join("\n\n");

    const files = tasks
      .filter((task) => task.filePath)
      .map((task, index) => ({
        name: `image-${index + 1}.png`,
        contents: fs.readFileSync(task.filePath!),
      }));

    const logEmbed = (
      <ComponentMessage files={files}>
        <Container accentColor={0x5865f2}>
          <TextDisplay>## Member kicked</TextDisplay>
          <TextDisplay>
            {user.mention} ({user.id}) has been kicked
          </TextDisplay>

          <TextDisplay>
            ### Details
            <Br />
            {taskDetails}
          </TextDisplay>

          <MediaGallery>
            {tasks
              .filter((task) => task.filePath && task.result)
              .map((task, index) => (
                <MediaGalleryItem
                  url={`attachment://image-${index + 1}.png`}
                  description={task.type}
                  spoiler
                />
              ))}
          </MediaGallery>
        </Container>
      </ComponentMessage>
    );

    await logChannel.createMessage(logEmbed);
    consola.info("Log has been sent");

    for (const task of tasks) {
      if (!task.filePath) continue;

      try {
        fs.unlinkSync(task.filePath);
      } catch (err) {
        consola.error(`Failed to delete ${task.filePath}:`, err);
      }
    }

    for (const channel of await guild.getChannels()) {
      if (channel.type !== ChannelTypes.GUILD_TEXT) continue;

      try {
        const recentMessages = await channel.getMessages({ limit: 100 });
        const userMessages = recentMessages
          .filter((m) => m.author.id == user.id)
          .map((m) => m.id);

        if (userMessages.length > 0) {
          await channel.deleteMessages(
            userMessages,
            "Messages from comprimised account",
          );
        }
      } catch (err: any) {
        consola.error("Error while deleting messages from", channel, err);
      }
    }

    consola.success("Messages deleted, user removed.");
    removedUsers.delete(user.id);
  } catch (err: any) {
    removedUsers.delete(user.id);
    consola.error("Error removing user:", err);
  }
}

export async function handleMessage(message: Message) {
  if (!message.guild) return;
  if (
    removedUsers.has(message.author.id) ||
    processingUsers.has(message.author.id)
  )
    return;

  const guildConfig = getGuildConfig(message.guild.id);
  if (!guildConfig || guildConfig.enabled == 0) return;

  processingUsers.add(message.author.id);
  try {
    const tasks: Task[] = [];

    if (message.content) {
      const imageURLs = extractImageUrls(message.content);

      for (const url of imageURLs) {
        tasks.push({
          type: "url",
          value: url,
        });
      }
    }

    for (const attachment of message.attachments.values()) {
      if (!attachment.contentType?.includes("image")) continue;

      tasks.push({
        type: "attachment",
        value: attachment.url,
      });
    }

    await Promise.all(
      tasks.map(async (task) => {
        consola.debug("Processing task", task.value);

        let filePath: string | undefined;
        try {
          filePath = await downloadImage(task.value);

          if (!filePath) return;
          task.filePath = filePath;

          const text = await readTextFromImage(filePath);
          const result = checkContent(text, "ocr");

          task.result = result;
          consola.debug(
            [
              `Task: ${task.type}`,
              `Reference: ${task.value}`,
              `Detected: ${result.detected}`,
              `Confidence: ${result.confidence}%`,
              `Matches: ${
                result.matches.length
                  ? result.matches.map((m) => m.source).join(", ")
                  : "none"
              }`,
            ].join("\n"),
          );
        } catch (err: any) {
          consola.error("OCR error:", err);
        }
      }),
    );

    const detected = tasks.some((task) => task.result?.detected);
    consola.debug("Final result, detected:", detected);

    if (detected) await removeUser(message, tasks);
  } finally {
    processingUsers.delete(message.author.id);
  }
}
