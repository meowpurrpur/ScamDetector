import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface MentionableOptionProps {
  name: string;
  description: string;
  required?: boolean;
}

export function MentionableOption({
  name,
  description,
  required,
}: MentionableOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.MENTIONABLE,
    name,
    description,
    required,
  };
}
