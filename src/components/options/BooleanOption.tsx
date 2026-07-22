import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface BooleanOptionProps {
  name: string;
  description: string;
  required?: boolean;
}

export function BooleanOption({
  name,
  description,
  required,
}: BooleanOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.BOOLEAN,
    name,
    description,
    required,
  };
}
