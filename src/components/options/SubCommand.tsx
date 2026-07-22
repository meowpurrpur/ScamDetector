import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
  type ApplicationCommandOptionsSubCommand,
} from "oceanic.js";

import { childrenToArray } from "../../lib/jsx/utils";

export interface SubCommandProps {
  name: string;
  description: string;
  children?:
    | ApplicationCommandOptionsWithValue
    | ApplicationCommandOptionsWithValue[];
}

export function SubCommand({
  name,
  description,
  children,
}: SubCommandProps): ApplicationCommandOptionsSubCommand {
  return {
    type: ApplicationCommandOptionTypes.SUB_COMMAND,
    name,
    description,
    options: childrenToArray(children),
  };
}
