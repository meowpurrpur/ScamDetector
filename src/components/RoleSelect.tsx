import {
  ComponentTypes,
  type RoleSelectMenu,
} from "oceanic.js";

export interface RoleSelectProps {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
}

export function RoleSelect({
  customId,
  placeholder,
  minValues,
  maxValues,
  disabled,
}: RoleSelectProps): RoleSelectMenu {
  return {
    type: ComponentTypes.ROLE_SELECT,
    customID: customId,
    placeholder,
    minValues,
    maxValues,
    disabled,
  };
}
