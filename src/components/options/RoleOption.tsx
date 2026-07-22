import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface RoleOptionProps {
  name: string;
  description: string;
  required?: boolean;
}

export function RoleOption({
  name,
  description,
  required,
}: RoleOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.ROLE,
    name,
    description,
    required,
  };
}
