import { File, ExternalLink, FileText, FileSpreadsheet, FileCode, ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Attachment } from "@/src/types/server.types";
import { Button } from "@/src/ui/button";

// --- Helper: Icon Selector ---
const getFileIcon = (type: Attachment["mimeType"]) => {
  if (type.includes("pdf"))
    return <FileText className="h-5 w-5 text-red-500" />;
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    case "code":
      return <FileCode className="h-5 w-5 text-yellow-500" />;
    case "image":
      return <ImageIcon className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-blue-500" />;
  }
};

// --- Sub-Component: File Card (PDFs, Docs, Zips) ---
const FileAttachmentCard = ({ file }: { file: Attachment }) => {
  return (
    <div className="group flex items-center gap-3 rounded-md border bg-background/50 p-3 transition-colors hover:bg-accent hover:text-accent-foreground">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {getFileIcon(file.mimeType)}
      </div>

      <div className="flex-1 min-w-0 grid gap-0.5">
        <p className="text-sm font-medium leading-none truncate">
          {file.fileName}
        </p>
        <p className="text-xs text-muted-foreground">
          {file.fileSize} • {file.mimeType.toUpperCase()}
        </p>
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Download className="h-4 w-4" />
        </Button>
      </div>
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

export  function MessageAttachments({ attachments }: MessageAttachmentsProps) {
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
