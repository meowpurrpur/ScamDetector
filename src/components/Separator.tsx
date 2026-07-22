import {
  ComponentTypes,
  type SeparatorComponent,
} from "oceanic.js";

export interface SeparatorProps {
  divider?: boolean;
  spacing?: number;
}

export function Separator({
  divider = true,
  spacing = 1,
}: SeparatorProps): SeparatorComponent {
  return {
    type: ComponentTypes.SEPARATOR,
    divider,
    spacing,
  };
}
