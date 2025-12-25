import { useServerContext } from "@/src/context/server.provider";
import {
  ImageIcon,
  Laugh,
  Paperclip,
  Send,
  Sticker,
} from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/src/ui/input-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/src/ui/tooltip";
import { FileAttachmentViewer } from "../Josephine/input";

interface AttachedFile {
  file: File;
  preview?: string;
  id: string;
}

export default function ServerInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, setAttachments, messageInput, setMessageInput } =
    useServerContext();

  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      setAttachedFiles([]);
      await sendMessage();
    } catch (error) {
      console.error("Error in Sending Message", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-2 max-w-full">
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
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <Tooltip>
          <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
            >
              <ImageIcon />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Images</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
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
          <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-sm"
              className="rounded-full"
            >
              <Laugh />
            </InputGroupButton>
          </TooltipTrigger>
          <TooltipContent>Images</TooltipContent>
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
