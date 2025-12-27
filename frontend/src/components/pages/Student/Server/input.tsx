import { useServerContext } from "@/src/context/server.provider";
import { ImageIcon, Laugh, Paperclip, Send, Sticker, X } from "lucide-react";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/src/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import { FileAttachmentViewer } from "../Josephine/input";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/ui/tabs";
import { Grid } from "@giphy/react-components";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { useTheme } from "next-themes";

interface AttachedFile {
  file: File;
  preview?: string;
  id: string;
}

export default function ServerInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    sendMessage,
    setAttachments,
    messageInput,
    changeMessage,
    typingStatus,
  } = useServerContext();

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      const id = `${Date.now()}-${Math.random()}`;

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedFiles((prev) => [
            ...prev,
            { file, preview: reader.result as string, id },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just add without preview
        setAttachedFiles((prev) => [...prev, { file, id }]);
      }
    });
    setAttachments(Array.from(files));
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSend = async () => {
    try {
      setAttachedFiles([]);
      await sendMessage();
    } catch (error) {
      console.error("Error in Sending Message", error);
    }
  };

  const handleText = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await sendMessage();
    }
  };
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText =
      messageInput.substring(0, start) + text + messageInput.substring(end);

    changeMessage(newText);

    // Reset cursor position after React updates
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + text.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleInsertEmoji = (emoji: string) => {
    insertAtCursor(emoji);
  };

  const handleInsertGif = (gifUrl: string) => {
    insertAtCursor(`\n[GIF: ${gifUrl}]\n`);
  };

  const handleInsertSticker = (stickerUrl: string) => {
    insertAtCursor(`\n[STICKER: ${stickerUrl}]\n`);
  };
  return (
    <div className="relative w-full p-2 max-w-full">
      {/* Typing Status Indicator */}
      {typingStatus && (
        <div className="px-2 py-1 mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex gap-1">
            <span
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
          <span className="text-xs">{typingStatus}</span>
        </div>
      )}
      <MediaKeyboard
        onInsertEmoji={handleInsertEmoji}
        onInsertGif={handleInsertGif}
        onInsertSticker={handleInsertSticker}
        onClose={() => {}}
      />
      <FileAttachmentViewer files={attachedFiles} onRemove={handleRemoveFile} />
      <InputGroup className="px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <InputGroupButton
              variant="ghost"
              className="rounded-full"
              size="icon-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <InputGroupInput
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <Paperclip />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Attachments</TooltipContent>
        </Tooltip>
        <InputGroupTextarea
          placeholder="Enter your Message"
          value={messageInput}
          className="max-h-[100px] overflow-y-auto custom-scrollbar"
          onChange={(e) => changeMessage(e.target.value)}
          onKeyDown={handleText}
        />
        <Tooltip>
          <TooltipTrigger className="ml-auto" asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
            >
              <Sticker />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Stickers</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger className="max-sm:ml-auto" asChild>
            <InputGroupButton
              variant="ghost"
              className="rounded-full"
              size="icon-sm"
              onClick={handleSend}
            >
              <>
                <Send />
                <span className="sr-only">Send</span>
              </>
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Send</TooltipContent>
        </Tooltip>
      </InputGroup>
    </div>
  );
}

// Initialize Giphy - Get your API key from developers.giphy.com
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || ""; 

const gf = new GiphyFetch(GIPHY_API_KEY);

// Sample stickers - replace with your actual sticker URLs
const stickerPacks = [
  { id: 1, url: "https://example.com/sticker1.png", name: "Happy" },
  { id: 2, url: "https://example.com/sticker2.png", name: "Love" },
  { id: 3, url: "https://example.com/sticker3.png", name: "Sad" },
  { id: 4, url: "https://example.com/sticker4.png", name: "Party" },
  { id: 5, url: "https://example.com/sticker5.png", name: "Cool" },
  { id: 6, url: "https://example.com/sticker6.png", name: "Angry" },
];

interface MediaKeyboardProps {
  onInsertEmoji: (emoji: string) => void;
  onInsertGif: (gifUrl: string) => void;
  onInsertSticker: (stickerUrl: string) => void;
  onClose: () => void;
}

function MediaKeyboard({
  onInsertEmoji,
  onInsertGif,
  onInsertSticker,
  onClose,
}: MediaKeyboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { theme } = useTheme();

  const fetchGifs = (offset: number) => {
    if (searchTerm) {
      return gf.search(searchTerm, { offset, limit: 10 });
    }
    return gf.trending({ offset, limit: 10 });
  };

  const onGifClick = (gif: any, e: React.SyntheticEvent) => {
    e.preventDefault();
    const gifUrl = gif.images.fixed_height.url;
    onInsertGif(gifUrl);
  };

  const onEmojiClick = (emojiObject: any) => {
    onInsertEmoji(emojiObject.emoji);
  };

  return (
    <div className="absolute bottom-full max-w-md right-0 left-0 mb-2 bg-background border rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="text-sm font-medium">Media Picker</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-accent rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <Tabs defaultValue="emoji" className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
          <TabsTrigger value="emoji">😊 Emoji</TabsTrigger>
          <TabsTrigger value="gifs">GIF</TabsTrigger>
          <TabsTrigger value="stickers">🎨 Stickers</TabsTrigger>
        </TabsList>

        <TabsContent value="emoji" className="m-0 p-2">
          <div className="max-h-[350px] overflow-hidden">
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width="100%"
              height={350}
              theme={theme as Theme}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
              
            />
          </div>
        </TabsContent>

        <TabsContent value="gifs" className="max-h-[350px] m-0 p-2">
          <div className="mb-2 ">
            <input
              type="text"
              placeholder="Search GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

            />
          </div>
          <div className="h-[350px] overflow-y-auto custom-scrollbar">
            <Grid
              key={searchTerm}
              width={400}
              columns={2}
              fetchGifs={fetchGifs}
              onGifClick={onGifClick}
            />
          </div>
        </TabsContent>

        <TabsContent value="stickers" className="m-0 p-2">
          <div className="grid grid-cols-4 gap-2 max-h-[350px] overflow-y-auto custom-scrollbar p-2">
            {stickerPacks.map((sticker) => (
              <button
                key={sticker.id}
                onClick={() => onInsertSticker(sticker.url)}
                className="aspect-square rounded-lg border-2 border-transparent hover:border-blue-500 transition-all overflow-hidden bg-accent/50 hover:bg-accent flex items-center justify-center"
                title={sticker.name}
              >
                <img
                  src={sticker.url}
                  alt={sticker.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback for broken images
                    e.currentTarget.src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="50">🎨</text></svg>';
                  }}
                />
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
