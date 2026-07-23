import { client } from "./lib/client";
import config from "./lib/config";
import { loadEvents } from "./events";
import consola, { LogLevel } from "consola";
import { loadCommands } from "./commands";

consola.level = config.LOG_LEVEL ? (Number(config.LOG_LEVEL) as LogLevel) : 5;

async function start() {
  consola.info("Starting up...");
  const commands = await loadCommands();

  for (const [name, command] of Object.entries(commands)) {
    client.commands.set(name, command);
  }

  const events = await loadEvents();
  for (const event of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  await client.connect();
}

start();
