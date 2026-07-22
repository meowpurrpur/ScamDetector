import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface StringOptionProps {
  name: string;
  description: string;
  required?: boolean;
  choices?: string[];
}

export function StringOption({
  name,
  description,
  required,
  choices,
}: StringOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.STRING,
    name,
    description,
    required,
    choices: choices?.map((c) => ({ name: c, value: c })),
  };
}
