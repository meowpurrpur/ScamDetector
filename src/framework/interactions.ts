import type { ComponentInteraction } from "oceanic.js";

const components = new Map<
  string,
  (interaction: ComponentInteraction) => Promise<void>
>();

export function registerComponent(
  id: string,
  handler: (interaction: ComponentInteraction) => Promise<void>,
) {
  components.set(id, handler);
}

export async function handleComponentInteraction(
  interaction: ComponentInteraction,
) {
  const handler = components.get(interaction.data.customID);
  if (!handler) return;

  await handler(interaction);
}
