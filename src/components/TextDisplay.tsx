import {
  ComponentTypes,
  type TextDisplayComponent,
} from "oceanic.js";

import { childrenToArray } from "../lib/jsx/utils";

export interface TextDisplayProps {
  children: string | string[];
}

export function TextDisplay({
  children,
}: TextDisplayProps): TextDisplayComponent {
  return {
    type: ComponentTypes.TEXT_DISPLAY,
    content: childrenToArray(children).join(""),
  };
}
