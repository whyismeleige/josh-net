import EmojiPicker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";

const detectDeviceType = (userAgent: string): EmojiStyle => {
  // Check for Apple devices
  const isApple = /iphone|ipad|ipod|macintosh|mac os x/i.test(userAgent);

  return isApple ? ("apple" as EmojiStyle) : ("google" as EmojiStyle);
};

export default function EmojiMenu({
  onEmojiClick,
}: {
  onEmojiClick: (emoji: EmojiClickData, event: MouseEvent) => void;
}) {
  const { theme } = useTheme();
  return (
    <EmojiPicker
      onEmojiClick={onEmojiClick}
      width="100%"
      height={350}
      theme={theme as Theme}
      emojiStyle={detectDeviceType(navigator.userAgent)}
      searchPlaceHolder="Search emoji..."
    />
  );
}
