import consola from "consola";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ quiet: true, path: path.join(__dirname, "../../.env") });

const {
  DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID,
  GUILD_ID,
  LOG_CHANNEL_ID,
  GUILD_INVITE,
  LOG_LEVEL,
} = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID || !GUILD_ID || !LOG_CHANNEL_ID || !GUILD_INVITE) {
  consola.fatal("Required environment variables are missing!");
  process.exit(1);
}

export default {
  DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID,
  GUILD_ID,
  LOG_CHANNEL_ID,
  GUILD_INVITE,
  LOG_LEVEL,
};
