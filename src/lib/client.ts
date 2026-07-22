import { Client, Collection, Intents } from "oceanic.js";
import config from "./config";

export const client = new Client({
  auth: `Bot ${config.DISCORD_BOT_TOKEN}`,
  gateway: {
    intents: [
      Intents.GUILDS,
      Intents.GUILD_MESSAGES,
      Intents.MESSAGE_CONTENT,
      Intents.DIRECT_MESSAGES,
    ],
  },
});

client.commands = new Collection();
