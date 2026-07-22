import consola from "consola";
import fs from "node:fs";
import {
  AnyTextableGuildChannel,
  ChannelTypes,
  Message,
  MessageFlags,
  User,
} from "oceanic.js";
import { downloadImage, extractImageUrls, readTextFromImage } from "./utils";
import { checkText } from "./filter";
import { client } from "../client";
import config from "../config";
import { Container, TextDisplay } from "../../components";

export const processingUsers = new Set<string>();
export const removedUsers = new Set<string>();

type Task = {
  type: "url" | "attachment";
  value: string;
};

type Result = RegExp | false;

async function removeUser(user: User, tasks: Task[], results: Result[]) {
  if (removedUsers.has(user.id)) return;
  removedUsers.add(user.id);

  consola.info(`Removing ${user.username} (${user.id})...`);
  try {
    const guild = await client.rest.guilds.get(config.GUILD_ID);
    const logChannel = guild.channels.get(
      config.LOG_CHANNEL_ID,
    ) as AnyTextableGuildChannel;

    if (!guild || !logChannel)
      throw Error("Guild or log channel was not found");

    const userMessage = (
      <Container accentColor={0x5865f2}>
        <TextDisplay>
          {`Hello, **${user.username}**,

Your account has been flagged for possible spam activity or a compromised account and has been removed from \`${guild.name}\`.

**To rejoin, please click [here](${config.GUILD_INVITE})**! We hope this will be your first and last warning, please ensure your account is secure and follows the server rules to avoid future bans.

For guidance on securing your account and avoiding social engineering attacks, we recommend reading [this article](https://discord.com/safety/securing-your-discord-account) from Discord.

Thank you for your understanding,
*${guild.name}*`}
        </TextDisplay>
      </Container>
    );

    try {
      const userChannel = await user.createDM();
      userChannel.createMessage({
        components: [userMessage],
        flags: MessageFlags.IS_COMPONENTS_V2,
      });

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
        return `**Source:** ${t.type}\n**Reference:** ${t.value}\n**Detected:** \`${results[i] || "None"}\``;
      })
      .join("\n\n");

    const logEmbed = (
      <Container accentColor={0x5865f2}>
        <TextDisplay>{`## Member kicked
- <@${user.id}> (${user.id}) has been kicked
### Results:
${taskDetails}
        `}</TextDisplay>
      </Container>
    );

    await logChannel.createMessage({
      components: [logEmbed],
      flags: MessageFlags.IS_COMPONENTS_V2,
    });
    consola.info("Log has been sent");

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
  if (
    removedUsers.has(message.author.id) ||
    processingUsers.has(message.author.id)
  )
    return;

  processingUsers.add(message.author.id);

  try {
    const tasks: Task[] = [];
    const results: Result[] = [];
    let detected = false;

    if (message.content) {
      const imageURLs = extractImageUrls(message.content);

      for (const url of imageURLs) {
        consola.debug(`Found URL: ${url}`);
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

    for (const task of tasks) {
      consola.debug("Processing task", task);
      try {
        const filePath = await downloadImage(task.value);
        if (!filePath) continue;

        const text = await readTextFromImage(filePath);
        const result = checkText(text);

        consola.debug("Detected text:", text ?? "none", "Result:", result);
        results.push(result);

        if (result !== false) detected = true;
        fs.unlinkSync(filePath);
      } catch (err: any) {
        consola.error("OCR error:", err);
      }
    }

    consola.debug("Final result, detected:", detected);
    if (detected) await removeUser(message.author, tasks, results);
  } finally {
    processingUsers.delete(message.author.id);
  }
}
