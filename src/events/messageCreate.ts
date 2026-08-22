import handleMessage from "../lib/handling/handleMessage";
import { Message } from "oceanic.js";

export const name = "messageCreate";
export async function execute(message: Message) {
  if (message.author.bot) return;
  if (!message.guild) return;
  
  handleMessage(message);
}
