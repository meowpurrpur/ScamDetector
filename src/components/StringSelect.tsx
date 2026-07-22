import {
  ComponentTypes,
  type StringSelectMenu,
} from "oceanic.js";

export interface StringSelectProps {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  options?: {
    label: string;
    value: string;
    description?: string;
    emoji?: any;
    default?: boolean;
  }[];
}

export function StringSelect({
  customId,
  placeholder,
  minValues,
  maxValues,
  disabled,
  options = [],
}: StringSelectProps): StringSelectMenu {
  return {
    type: ComponentTypes.STRING_SELECT,
    customID: customId,
    placeholder,
    minValues,
    maxValues,
    disabled,
    options,
  };
}
