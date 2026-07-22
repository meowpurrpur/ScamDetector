import {
    ComponentTypes,
    type ThumbnailComponent
} from "oceanic.js";

export interface ThumbnailProps {
    url: string;
    description?: string;
}

export function Thumbnail({
    url,
    description
}: ThumbnailProps): ThumbnailComponent {
    return {
        type: ComponentTypes.THUMBNAIL,
        media: {
            url
        },
        description
    };
}
