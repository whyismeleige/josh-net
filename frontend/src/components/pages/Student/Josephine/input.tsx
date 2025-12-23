import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useJosephineContext } from "@/src/context/josephine.provider";
import { useAppDispatch } from "@/src/hooks/redux";
import { addNotification } from "@/src/store/slices/notification.slice";
import {
  SiClaude,
  SiGooglegemini,
  SiOpenai,
} from "@icons-pack/react-simple-icons";
import {
  ArrowUpIcon,
  AudioLines,
  File,
  FileCode,
  FileText,
  ImageIcon,
  Paperclip,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, KeyboardEvent, useRef, useState } from "react";

export default function JosephineInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const { prompt, setPrompt, sendPrompt, setSelectedFiles } =
    useJosephineContext();

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
    setSelectedFiles(Array.from(files));
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await sendPrompt();
    } catch (error) {
      dispatch(
        addNotification({
          type: "error",
          title: "Error in Sending Prompt",
          description:
            error instanceof Error ? error.message : "Error in Sending Prompt",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleText = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() !== "") await handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <FileAttachmentViewer files={attachedFiles} onRemove={handleRemoveFile} />
      <InputGroup
        className={`${attachedFiles.length > 0 && "rounded-t-none border-t-0"}`}
      >
        <InputGroupTextarea
          placeholder="Ask Josephine..."
          value={prompt}
          className="max-h-[200px] overflow-y-auto custom-scrollbar"
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleText}
        />
        <InputGroupAddon align="block-end">
          <Tooltip>
            <TooltipTrigger asChild>
              <InputGroupButton
                variant="outline"
                className="rounded-full"
                size="icon-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <InputGroupInput
                  ref={fileInputRef}
                  type="file"
                  className="hidden rounded-full"
                  multiple
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {loading ? <Spinner /> : <Paperclip />}
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Attachments</TooltipContent>
          </Tooltip>
          <Select defaultValue="claude-sonnet-4-5-20250929">
            <SelectTrigger className="w-[180px] sm:w-[180px] max-sm:w-[120px] max-sm:text-xs">
              <SelectValue placeholder="Select a AI Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Models</SelectLabel>
                <SelectItem value="claude-sonnet-4-5-20250929">
                  <SiClaude /> Claude Sonnet 4.5
                </SelectItem>
                <SelectItem value="claude-haiku-4-5-20251001">
                  <SiClaude /> Claude Haiku 4.5
                </SelectItem>
                <SelectItem value="claude-opus-4-5-20251101">
                  <SiClaude /> Claude Opus 4.5
                </SelectItem>
                <SelectItem value="gpt-4.1" disabled>
                  <SiOpenai /> GPT-4.1 <Badge>Coming Soon</Badge>
                </SelectItem>
                <SelectItem value="o3" disabled>
                  <SiOpenai /> o3 <Badge>Coming Soon</Badge>
                </SelectItem>
                <SelectItem value="gemini-2.5" disabled>
                  <SiGooglegemini /> Gemini 2.5 <Badge>Coming Soon</Badge>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger className="ml-auto max-sm:hidden" asChild>
              <InputGroupButton
                variant="outline"
                size="icon-sm"
                className="rounded-full cursor-not-allowed"
              >
                <AudioLines />
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Voice, Coming Soon...</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="max-sm:ml-auto" asChild>
              <InputGroupButton
                variant="default"
                className="rounded-full"
                size="icon-sm"
                onClick={handleSubmit}
                disabled={prompt.trim() === "" || loading}
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <ArrowUpIcon />
                    <span className="sr-only">Send</span>
                  </>
                )}
              </InputGroupButton>
            </TooltipTrigger>
            <TooltipContent>Send</TooltipContent>
          </Tooltip>
        </InputGroupAddon>
      </InputGroup>
      <div className="text-xs text-center m-2 text-secondary">
        <p>Josephine can make mistakes. Please double check responses.</p>
      </div>
    </div>
  );
}

interface AttachedFile {
  file: File;
  preview?: string;
  id: string;
}

interface FileAttachmentViewerProps {
  files: AttachedFile[];
  onRemove: (id: string) => void;
  className?: string;
}

export function FileAttachmentViewer({
  files,
  onRemove,
  className,
}: FileAttachmentViewerProps) {
  if (files.length === 0) return null;

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/"))
      return <ImageIcon className="h-4 w-4" />;
    if (file.type.startsWith("text/")) return <FileText className="h-4 w-4" />;
    if (file.type.includes("pdf")) return <FileText className="h-4 w-4" />;
    if (
      file.type.includes("code") ||
      file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp)$/)
    ) {
      return <FileCode className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border-x border-t shadow-xs p-2 rounded-t-md dark:bg-input/30",
        className
      )}
    >
      {files.map((attachedFile) => (
        <div
          key={attachedFile.id}
          className="relative group rounded-lg border bg-card overflow-hidden hover:border-primary/50 transition-colors"
          style={{ width: "120px", height: "120px" }}
        >
          {/* Preview Content */}
          <div className="w-full h-full flex items-center justify-center p-2">
            {attachedFile.file.type.startsWith("image/") &&
            attachedFile.preview ? (
              <Image
                src={attachedFile.preview}
                alt={attachedFile.file.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                {getFileIcon(attachedFile.file)}
                <span className="text-xs text-center line-clamp-2 px-1 break-all">
                  {attachedFile.file.name}
                </span>
              </div>
            )}
          </div>

          {/* Overlay with file info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p
              className="text-xs text-white truncate"
              title={attachedFile.file.name}
            >
              {attachedFile.file.name}
            </p>
            <p className="text-xs text-white/70">
              {formatFileSize(attachedFile.file.size)}
            </p>
          </div>

          {/* Remove button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(attachedFile.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
