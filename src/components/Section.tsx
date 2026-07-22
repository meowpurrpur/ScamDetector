import {
  ComponentTypes,
  type SectionComponent,
  type ThumbnailComponent,
  type ButtonComponent,
  type TextDisplayComponent,
} from "oceanic.js";

import { childrenToArray } from "../lib/jsx/utils";

export interface SectionProps {
  children: TextDisplayComponent[];
  accessory: ThumbnailComponent | ButtonComponent;
}

export function Section({
  children,
  ...props
}: SectionProps): SectionComponent {
  return {
    type: ComponentTypes.SECTION,
    components: childrenToArray(children),
    ...props,
  };
}
