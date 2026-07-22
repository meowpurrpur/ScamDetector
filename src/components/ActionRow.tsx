import {
  ComponentTypes,
  type MessageActionRow,
  type MessageActionRowComponent,
} from "oceanic.js";

import { childrenToArray } from "../lib/jsx/utils";

export interface ActionRowProps {
  children: MessageActionRowComponent[];
}

export function ActionRow({
  children,
}: ActionRowProps): MessageActionRow {
  return {
    type: ComponentTypes.ACTION_ROW,
    components: childrenToArray(children),
  };
}
