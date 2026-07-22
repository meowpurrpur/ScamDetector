import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface ChannelOptionProps {
  name: string;
  description: string;
  required?: boolean;
}

export function ChannelOption({
  name,
  description,
  required,
}: ChannelOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.CHANNEL,
    name,
    description,
    required,
  };
}
