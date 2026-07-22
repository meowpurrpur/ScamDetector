import {
  ApplicationCommandOptionTypes,
  type ApplicationCommandOptionsWithValue,
} from "oceanic.js";

export interface AttachmentOptionProps {
  name: string;
  description: string;
  required?: boolean;
}

export function AttachmentOption({
  name,
  description,
  required,
}: AttachmentOptionProps): ApplicationCommandOptionsWithValue {
  return {
    type: ApplicationCommandOptionTypes.ATTACHMENT,
    name,
    description,
    required,
  };
}
