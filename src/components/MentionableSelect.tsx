import {
    ComponentTypes,
    type MentionableSelectMenu
} from "oceanic.js";

export interface MentionableSelectProps {
    customId: string;
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
}

export function MentionableSelect({
    customId,
    placeholder,
    minValues,
    maxValues,
    disabled
}: MentionableSelectProps): MentionableSelectMenu {
    return {
        type: ComponentTypes.MENTIONABLE_SELECT,
        customID: customId,
        placeholder,
        minValues,
        maxValues,
        disabled
    };
}
