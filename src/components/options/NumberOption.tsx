import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface NumberOptionProps {
  name: string;
  description: string;
  required?: boolean;
  choices?: number[];
}

export function NumberOption({
  name,
  description,
  required,
  choices,
}: NumberOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.NUMBER,
    name,
    description,
    required,
    choices: choices?.map((c) => ({ name: c.toString(), value: c })),
  };
}
