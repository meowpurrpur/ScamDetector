import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsSubCommand,
  type ApplicationCommandOptionsSubCommandGroup,
} from "oceanic.js";

import { childrenToArray } from "../../lib/jsx/utils";

export interface SubCommandGroupProps {
  name: string;
  description: string;
  children?:
    | ApplicationCommandOptionsSubCommand
    | ApplicationCommandOptionsSubCommand[];
}

export function SubCommandGroup({
  name,
  description,
  children,
}: SubCommandGroupProps): ApplicationCommandOptionsSubCommandGroup {
  return {
    type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
    name,
    description,
    options: childrenToArray(children),
  };
}
