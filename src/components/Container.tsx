import {
  ComponentTypes,
  type ContainerComponent,
  type MessageActionRow,
  type TextDisplayComponent,
  type SectionComponent,
  type MediaGalleryComponent,
  type SeparatorComponent,
  type FileComponent,
} from "oceanic.js";

import { childrenToArray } from "../lib/jsx/utils";

export interface ContainerProps {
  children: (
    | MessageActionRow
    | TextDisplayComponent
    | SectionComponent
    | MediaGalleryComponent
    | SeparatorComponent
    | FileComponent
  )[];
  accentColor?: number;
}

export function Container({
  children,
  ...props
}: ContainerProps): ContainerComponent {
  return {
    type: ComponentTypes.CONTAINER,
    components: childrenToArray(children),
    ...props,
  };
}
