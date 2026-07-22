import consola from "consola";
import { client } from "../lib/client";

export const name = "ready";
export const once = true;

export async function execute(...args: any[]) {
  consola.success(`Client "${client.user.username}" has logged in!`);
}
