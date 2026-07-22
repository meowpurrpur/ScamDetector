import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface IntegerOptionProps {
  name: string;
  description: string;
  required?: boolean;
  choices?: number[];
}

export function IntegerOption({
  name,
  description,
  required,
  choices,
}: IntegerOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.INTEGER,
    name,
    description,
    required,
    choices: choices?.map((c) => ({ name: c.toString(), value: c })),
  };
}
