import consola from "consola";
import { Message } from "oceanic.js";
import { processingUsers, removedUsers } from "./shared";
import { getGuildConfig, getGuildExclusions } from "../db";
import {
  downloadImage,
  extractImageUrls,
  readTextFromImage,
} from "../ocr/utils";
import { checkImage } from "../hash/utils";
import { checkContent } from "../ocr/rules";
import removeUser from "./removeUser";
import {
  calculateTaskConfidence,
  evaluateMessage,
  defaultConfidence,
} from "./confidence";

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

      const textResult = checkContent(message.content, "text");
      if (textResult.confidence > 0 || tasks.length === 0) {
        tasks.push({
          type: "text",
          value: message.content,
          confidence: textResult.confidence,
          detected: textResult.detected,
          results: {
            text: textResult,
          },
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
      tasks
        .filter((task) => task.type === "url" || task.type === "attachment")
        .map(async (task) => {
          consola.debug("Processing image task", task.value);

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

            task.confidence = calculateTaskConfidence(task.results);
            task.detected = task.confidence >= defaultConfidence;

            consola.debug(
              [
                `Task: ${task.type}`,
                `Reference: ${task.value}`,
                `Task Confidence: ${task.confidence}% (Detected: ${task.detected})`,
                `OCR Confidence: ${ocrResult.confidence}% (Detected: ${ocrResult.detected})`,
                `OCR matches: ${
                  ocrResult.rules?.length
                    ? ocrResult.rules
                        .map((rule) => rule.pattern.source)
                        .join(", ")
                    : "none"
                }`,
                `Image Hash: ${imageResult ? "detected" : "none"}`,
                `Image Similarity: ${
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

    const evaluation = evaluateMessage(tasks, defaultConfidence);
    const { detected, overallConfidence, threshold } = evaluation;

    consola.debug(
      [
        `Tasks evaluated: ${tasks.length}`,
        ...tasks.map(
          (t, i) =>
            `  Task ${i + 1} [${t.type}]: confidence=${t.confidence ?? 0}%, flagged=${t.detected ?? false}`,
        ),
        `Overall Confidence: ${overallConfidence}% (Threshold: ${threshold}%)`,
        `Final Decision: ${detected ? "remove" : "ignore"}`,
      ].join("\n"),
    );

    if (detected)
      await removeUser(message, tasks, overallConfidence, threshold);
  } finally {
    processingUsers.delete(message.author.id);
  }
}
