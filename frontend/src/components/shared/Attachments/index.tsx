import {
  File,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  FileCode,
  ImageIcon,
  Download,
  Video,
  Music,
  Archive,
  FileJson,
  Presentation,
  FileArchive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Attachment } from "@/src/types/server.types";
import { Button } from "@/src/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/src/ui/spinner";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Get File Type --- Helper Function
const getFileType = (mimeType: string): string => {
  // Image types
  if (mimeType.startsWith("image/")) {
    return "image";
  }

  // Video types
  if (mimeType.startsWith("video/")) {
    return "video";
  }

  // Audio types
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }

  // PDF
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType === "application/zip") {
    return "zip";
  }

  // Word documents
  const wordTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.oasis.opendocument.text",
  ];
  if (wordTypes.includes(mimeType)) {
    return "word";
  }

  // Excel/Spreadsheets
  const spreadsheetTypes = [
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.oasis.opendocument.spreadsheet",
    "text/csv",
  ];
  if (spreadsheetTypes.includes(mimeType)) {
    return "spreadsheet";
  }

  // PowerPoint/Presentations
  const presentationTypes = [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.presentation",
  ];
  if (presentationTypes.includes(mimeType)) {
    return "presentation";
  }

  // Archive types
  const archiveTypes = [
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-tar",
    "application/gzip",
    "application/x-bzip2",
  ];
  if (archiveTypes.includes(mimeType)) {
    return "archive";
  }

  // JSON
  if (mimeType === "application/json") {
    return "json";
  }

  // Code/text types
  const codeTypes = [
    "text/html",
    "text/css",
    "text/javascript",
    "application/javascript",
    "text/xml",
    "application/xml",
    "application/typescript",
    "text/x-python",
    "text/x-java",
    "text/x-c",
    "text/x-cpp",
  ];
  if (codeTypes.includes(mimeType)) {
    return "code";
  }

  // Plain text
  if (mimeType === "text/plain" || mimeType.startsWith("text/")) {
    return "text";
  }

  // Default
  return "file";
};

// --- Helper: Icon Selector ---
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "zip":
      return <FileArchive className="h-5 w-5 text-black-500"/>
    case "word":
      return <FileText className="h-5 w-5 text-blue-600" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    case "presentation":
      return <Presentation className="h-5 w-5 text-orange-500" />;
    case "code":
      return <FileCode className="h-5 w-5 text-yellow-500" />;
    case "json":
      return <FileJson className="h-5 w-5 text-yellow-600" />;
    case "image":
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    case "video":
      return <Video className="h-5 w-5 text-pink-500" />;
    case "audio":
      return <Music className="h-5 w-5 text-indigo-500" />;
    case "archive":
      return <Archive className="h-5 w-5 text-gray-600" />;
    case "text":
      return <FileText className="h-5 w-5 text-gray-500" />;
    default:
      return <File className="h-5 w-5 text-blue-500" />;
  }
};

// --- Sub-Component: File Card (PDFs, Docs, Zips) ---
const FileAttachmentCard = ({ file }: { file: Attachment }) => {
  const fileType = getFileType(file.mimeType);
  return (
    <div className="group flex flex-col gap-4 rounded-md border bg-background/50 p-3 transition-colors hover:bg-accent hover:text-accent-foreground">
      <div className="flex flex-1 gap-2 items-center">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          {getFileIcon(fileType)}
        </div>
        <div className="flex-1 min-w-0 grid gap-0.5">
          <p className="text-sm font-medium leading-none truncate">
            {file.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {fileType.toUpperCase()}  • {formatFileSize(file.fileSize)}
          </p>
        </div>
        {/* @todo Upload Abort Logic */}
        {/* {!file.transferring ? (
          <Button variant="ghost" size="icon" className="rounded-md h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        ) : file.transferProgress ? (
          <Button variant="ghost" size="icon" className="rounded-md h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Spinner className="size-6"/>
        )} */}
        {!file.transferring ? (
          <Button variant="ghost" size="icon" className="rounded-md h-8 w-8">
            <Download className="h-4 w-4" />
          </Button>
        ) : (
          <Spinner className="size-6" />
        )}
      </div>

      {file.transferring && file.transferProgress && (
        <Progress value={file.transferProgress} />
      )}
    </div>
  );
};

// --- Sub-Component: Image Grid ---
const ImageAttachmentGrid = ({ images }: { images: Attachment[] }) => {
  if (images.length === 0) return null;

  // Dynamic grid based on count (1 = full, 2 = half, 3+ = grid)
  const gridClass =
    images.length === 1
      ? "grid-cols-1 max-w-[300px]"
      : "grid-cols-2 max-w-[400px]";

  return (
    <div className={cn("grid gap-2 mt-2", gridClass)}>
      {images.map((img) => (
        <div
          key={img.id}
          className="relative aspect-square overflow-hidden rounded-md border bg-muted group"
        >
          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Component ---
interface MessageAttachmentsProps {
  attachments: Attachment[];
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  // Separate Images from Files
  const images = attachments.filter((a) => a.mimeType === "image");
  const files = attachments.filter((a) => a.mimeType !== "image");

  return (
    <div className="mt-2 space-y-2">
      {/* 1. Render Images Grid */}
      <ImageAttachmentGrid images={images} />

      {/* 2. Render File List */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 max-w-sm">
          {files.map((file) => (
            <FileAttachmentCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
