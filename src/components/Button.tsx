import { ComponentTypes, type ButtonComponent } from "oceanic.js";

export interface ButtonProps {
  style: number;
  children?: string;
  disabled?: boolean;
  emoji?: any;
  customId?: string;
  url?: string;
}

export function Button({
  children,
  customId,
  url,
  ...props
}: ButtonProps): ButtonComponent {
  if (url) {
    return {
      type: ComponentTypes.BUTTON,
      style: props.style,
      url,
      label: children,
      disabled: props.disabled,
      emoji: props.emoji,
    };
  }

  return {
    type: ComponentTypes.BUTTON,
    style: props.style,
    customID: customId!,
    label: children,
    disabled: props.disabled,
    emoji: props.emoji,
  };
}
