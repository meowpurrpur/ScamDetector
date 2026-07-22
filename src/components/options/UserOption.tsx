import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface UserOptionProps {
  name: string;
  description: string;
  required?: boolean;
}

export function UserOption({
  name,
  description,
  required,
}: UserOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.USER,
    name,
    description,
    required,
  };
}
