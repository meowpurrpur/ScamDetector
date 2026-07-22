import {
  ComponentTypes,
  type MediaGalleryComponent,
} from "oceanic.js";

export interface MediaGalleryProps {
  items: {
    url: string;
    description?: string;
  }[];
}

export function MediaGallery({
  items,
}: MediaGalleryProps): MediaGalleryComponent {
  return {
    type: ComponentTypes.MEDIA_GALLERY,
    items: items.map((item) => ({
      media: {
        url: item.url,
      },
      description: item.description,
    })),
  };
}
