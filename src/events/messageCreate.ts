import { handleMessage } from "../lib/processing";
import { Message } from "oceanic.js";

export const name = "messageCreate";
export async function execute(message: Message) {
  if (message.author.bot) return;
  handleMessage(message);
}
