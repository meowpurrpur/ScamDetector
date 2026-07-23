import type {
  MediaGalleryComponent,
  MediaGalleryItem as MediaGalleryItemComp,
} from "oceanic.js";
import { ComponentTypes } from "oceanic.js";

export interface MediaGalleryProps {
  children: MediaGalleryItemComp[];
}

export function MediaGallery({
  children,
}: MediaGalleryProps): MediaGalleryComponent {
  return {
    type: ComponentTypes.MEDIA_GALLERY,
    items: children,
  };
}
