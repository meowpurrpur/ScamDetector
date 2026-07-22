import {
  type ChannelTypes,
  ComponentTypes,
  type ChannelSelectMenu,
} from "oceanic.js";

export interface ChannelSelectProps {
  customId: string;
  placeholder?: string;
  minValues?: number;
  maxValues?: number;
  disabled?: boolean;
  channelTypes?: ChannelTypes[];
}

export function ChannelSelect({
  customId,
  placeholder,
  minValues,
  maxValues,
  disabled,
  channelTypes = [],
}: ChannelSelectProps): ChannelSelectMenu {
  return {
    type: ComponentTypes.CHANNEL_SELECT,
    customID: customId,
    placeholder,
    minValues,
    maxValues,
    disabled,
    channelTypes,
  };
}
