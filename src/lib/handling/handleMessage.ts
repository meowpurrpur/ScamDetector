import consola from "consola";
import { Message } from "oceanic.js";
import { processingUsers, removedUsers } from "./shared";
import { getGuildConfig, getGuildExclusions } from "../db";
import { downloadImage, extractImageUrls, readTextFromImage } from "../ocr/utils";
import { checkImage } from "../hash/utils";
import { checkContent } from "../ocr/rules";
import removeUser from "./removeUser";

export default async function handleMessage(message: Message) {
  if (!message.guild || !message.channel) return;
  if (
    removedUsers.has(message.author.id) ||
    processingUsers.has(message.author.id)
  )
    return;

  const exclusions = getGuildExclusions(message.guild.id);
  for (const exclusion of exclusions) {
    let excluded = false;
    switch (exclusion.type) {
      case "user":
        excluded = message.author.id === exclusion.id;
        break;
      case "role":
        excluded = message.member?.roles.includes(exclusion.id) ?? false;
        break;
      case "channel":
        excluded = message.channel.id === exclusion.id;
        break;
    }

    if (excluded) return;
  }

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

        try {
          const filePath = await downloadImage(task.value);
          if (!filePath) return;

          task.filePath = filePath;
          const [text, imageResult] = await Promise.all([
            readTextFromImage(filePath),
            checkImage(filePath),
          ]);

          const ocrResult = checkContent(text, "ocr");
          task.results = {
            ocr: ocrResult,
            image: imageResult,
          };

          consola.debug(
            [
              `Task: ${task.type}`,
              `Reference: ${task.value}`,
              `OCR: ${ocrResult.detected} (${ocrResult.confidence ?? 0}%)`,
              `OCR matches: ${
                ocrResult.rules?.length
                  ? ocrResult.rules
                      .map((rule) => rule.pattern.source)
                      .join(", ")
                  : "none"
              }`,
              `Image: ${imageResult ? "detected" : "none"}`,
              `Image similarity: ${
                imageResult
                  ? `${(imageResult.similarity * 100).toFixed(1)}%`
                  : "none"
              }`,
              `Image class: ${imageResult?.type ?? "none"}`,
              `Image match: ${imageResult?.name ?? "none"}`,
            ].join("\n"),
          );
        } catch (err) {
          consola.error("Image processing error:", err);
        }
      }),
    );

    const detected = tasks.some(
      (task) => task.results?.ocr.detected || task.results?.image !== null,
    );

    consola.debug("Final result, detected:", detected);
    if (detected && process.env.DEBUG_MODE !== "true")
      await removeUser(message, tasks);
  } finally {
    processingUsers.delete(message.author.id);
  }
}
