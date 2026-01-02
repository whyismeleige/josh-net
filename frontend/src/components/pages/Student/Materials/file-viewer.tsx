import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  FileImage,
  FileCode,
  Download,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";
import { useStudentContext } from "@/src/context/material.provider";
import Image from "next/image";

export default function FileViewer() {
  const { fileBlob } = useStudentContext();
  
  // Derive fileURL directly from fileBlob using useMemo
  const fileURL = useMemo(() => {
    if (!fileBlob) return "";
    return URL.createObjectURL(fileBlob);
  }, [fileBlob]);

  const [fileText, setFileText] = useState<string>("");
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cleanup effect for URL revocation
  useEffect(() => {
    if (fileURL) {
      return () => {
        URL.revokeObjectURL(fileURL);
      };
    }
  }, [fileURL]);

  // Effect for reading text files
  useEffect(() => {
  // Only run if we have a text file
  if (!fileBlob || !fileBlob.type.includes("text/plain")) {
    return;
  }

  let isMounted = true;
  const reader = new FileReader();
  
  reader.onload = () => {
    if (!isMounted) return;
    
    let text: string;
    if (typeof reader.result === "string") {
      text = reader.result;
    } else if (reader.result instanceof ArrayBuffer) {
      const decoder = new TextDecoder("utf-8");
      text = decoder.decode(reader.result);
    } else {
      text = "";
    }
    setFileText(text);
  };
  
  reader.readAsText(fileBlob);
  
  return () => {
    isMounted = false;
  };
}, [fileBlob]);

// Derive the display value
const displayText = fileBlob?.type.includes("text/plain") ? fileText : "";

  if (!fileBlob) {
    return null;
  }

  if (!fileURL) {
    return (
      <div className="flex items-center justify-center h-64 bg-muted/50 rounded-lg border border-border">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading content...</p>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  const renderControls = () => (
    <div className="flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="text-sm font-medium min-w-[3rem] text-center">
        {zoom}%
      </span>
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={toggleFullscreen}
        className="p-2 hover:bg-accent rounded-md transition-colors"
        title="Toggle Fullscreen"
      >
        {isFullscreen ? (
          <X className="w-4 h-4" />
        ) : (
          <FileImage className="w-4 h-4" />
        )}
      </button>
      <a
        href={fileURL}
        download="downloaded_file"
        className="p-2 hover:bg-accent rounded-md transition-colors"
        title="Download"
      >
        <Download className="w-4 h-4" />
      </a>
    </div>
  );

  if (fileBlob.type.includes("application/pdf")) {
    return (
      <div className="absolute top-0 right-0 left-0 group bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">PDF Document</h3>
        </div>

        <div className="absolute top-20 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {renderControls()}
        </div>

        <div className="p-4 bg-muted/30">
          <div
            className="bg-background rounded-md overflow-hidden shadow-inner"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <iframe
              src={fileURL}
              className="w-full h-[600px] border-0"
              title="pdf-content"
            />
          </div>
        </div>
      </div>
    );
  }

  if (fileBlob.type.includes("image/")) {
    return (
      <div className="group relative bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
          <FileImage className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Image Preview</h3>
        </div>

        <div className="absolute top-20 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {renderControls()}
        </div>

        <div
          className={`${
            isFullscreen
              ? "fixed inset-0 z-50 bg-background"
              : "p-4 bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-center min-h-[400px]">
            <Image
              src={fileURL}
              alt="Content"
              width={800}
              height={600}
              className="max-w-full h-auto rounded-md shadow-lg transition-transform"
              style={{ transform: `scale(${zoom / 100})` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (fileBlob.type.includes("text/plain") && fileText) {
    return (
      <div className="group relative bg-card rounded-lg border border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
          <FileCode className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Text Document</h3>
        </div>

        <div className="absolute top-20 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 p-2 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg">
            <a
              href={fileURL}
              download="downloaded_file"
              className="p-2 hover:bg-accent rounded-md transition-colors"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="p-4 bg-muted/30">
          <pre className="bg-background rounded-md p-4 overflow-auto max-h-[600px] text-sm font-mono border border-border shadow-inner whitespace-pre-wrap break-words">
            {fileText}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-medium text-foreground">
            Content type not supported for preview
          </p>
          <p className="text-sm text-muted-foreground">
            Download the file to view its contents
          </p>
        </div>
        <a
          href={fileURL}
          download="downloaded_file"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download File
        </a>
      </div>
    </div>
  );
}