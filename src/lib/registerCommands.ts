import { Client } from "oceanic.js";
import config from "./config";
import { loadCommands } from "../commands";
import consola from "consola";

const restClient = new Client({
  auth: `Bot ${config.DISCORD_BOT_TOKEN}`,
});

export async function registerCommands() {
  try {
    const commands = await loadCommands();
    const commandsData = Object.values(commands).map((command) => command.data);

    consola.info(`Registering ${commandsData.length} commands...`);
    await restClient.rest.applications.bulkEditGlobalCommands(
      config.DISCORD_CLIENT_ID,
      commandsData,
    );

    consola.success("Commands have been sucessfully registered!");
  } catch (error) {
    consola.error(error);
  }
}

registerCommands();
