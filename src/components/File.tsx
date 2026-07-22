import { ComponentTypes, type FileComponent } from "oceanic.js";

export interface FileProps {
  url: string;
  spoiler?: boolean;
}

export function File({ url, spoiler }: FileProps): FileComponent {
  return {
    type: ComponentTypes.FILE,
    file: {
      url,
    },
    spoiler,
  };
}
