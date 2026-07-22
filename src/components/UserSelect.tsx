import {
    ComponentTypes,
    type UserSelectMenu
} from "oceanic.js";

export interface UserSelectProps {
    customId: string;
    placeholder?: string;
    minValues?: number;
    maxValues?: number;
    disabled?: boolean;
}

export function UserSelect({
    customId,
    placeholder,
    minValues,
    maxValues,
    disabled
}: UserSelectProps): UserSelectMenu {
    return {
        type: ComponentTypes.USER_SELECT,
        customID: customId,
        placeholder,
        minValues,
        maxValues,
        disabled
    };
}
