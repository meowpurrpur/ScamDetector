import consola from "consola";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ quiet: true, path: path.join(__dirname, "../../.env") });

const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, LOG_LEVEL } = process.env;

if (!DISCORD_BOT_TOKEN || !DISCORD_CLIENT_ID) {
  consola.fatal("Required environment variables are missing!");
  process.exit(1);
}

export default {
  DISCORD_BOT_TOKEN,
  DISCORD_CLIENT_ID,
  LOG_LEVEL,
};
