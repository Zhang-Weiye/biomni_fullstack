import React from "react";
import { File, Image as ImageIcon, X as XIcon } from "lucide-react";
import type { Base64ContentBlock } from "@langchain/core/messages";
import { cn } from "@/lib/utils";
import Image from "next/image";
export interface MultimodalPreviewProps {
  block: Base64ContentBlock;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MultimodalPreview: React.FC<MultimodalPreviewProps> = ({
  block,
  removable = false,
  onRemove,
  className,
  size = "md",
}) => {
  // Image block
  if (
    block.type === "image" &&
    block.source_type === "base64" &&
    typeof block.mime_type === "string" &&
    block.mime_type.startsWith("image/")
  ) {
    const url = `data:${block.mime_type};base64,${block.data}`;
    let imgClass: string = "rounded-md object-cover h-16 w-16 text-lg";
    if (size === "sm") imgClass = "rounded-md object-cover h-10 w-10 text-base";
    if (size === "lg") imgClass = "rounded-md object-cover h-24 w-24 text-xl";
    return (
      <div className={cn("relative inline-block", className)}>
        <Image
          src={url}
          alt={String(block.metadata?.name || "uploaded image")}
          className={imgClass}
          width={size === "sm" ? 16 : size === "md" ? 32 : 48}
          height={size === "sm" ? 16 : size === "md" ? 32 : 48}
        />
        {removable && (
          <button
            type="button"
            className="absolute top-1 right-1 z-10 rounded-full bg-gray-500 text-white hover:bg-gray-700"
            onClick={onRemove}
            aria-label="Remove image"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // File block (PDF and other file types)
  if (
    block.type === "file" &&
    block.source_type === "base64"
  ) {
    const filename =
      block.metadata?.filename || block.metadata?.name || "File";
    
    // 根据文件类型选择不同的图标颜色
    const getFileIconColor = (mimeType: string) => {
      if (mimeType === "application/pdf") return "text-red-600";
      if (mimeType.includes("text/") || mimeType === "application/json") return "text-blue-600";
      if (mimeType.includes("csv") || mimeType.includes("excel")) return "text-green-600";
      if (mimeType.includes("hdf5") || mimeType === "application/octet-stream") return "text-purple-600";
      if (mimeType.includes("zip")) return "text-orange-600";
      return "text-gray-600";
    };

    const getFileTypeLabel = (mimeType: string) => {
      if (mimeType === "application/pdf") return "PDF";
      if (mimeType.includes("text/")) return "Text";
      if (mimeType.includes("csv")) return "CSV";
      if (mimeType.includes("json")) return "JSON";
      if (mimeType.includes("hdf5") || mimeType === "application/octet-stream") return "Data";
      if (mimeType.includes("excel")) return "Excel";
      if (mimeType.includes("zip")) return "Archive";
      return "File";
    };

    return (
      <div
        className={cn(
          "relative flex items-start gap-2 rounded-md border bg-gray-100 px-3 py-2",
          className,
        )}
      >
        <div className="flex flex-shrink-0 flex-col items-start justify-start">
          <File
            className={cn(
              getFileIconColor(block.mime_type || ""),
              size === "sm" ? "h-5 w-5" : "h-7 w-7",
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-800">
            {String(filename)}
          </div>
          <div className="text-xs text-gray-500">
            {getFileTypeLabel(block.mime_type || "")}
          </div>
        </div>
        {removable && (
          <button
            type="button"
            className="ml-2 self-start rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300"
            onClick={onRemove}
            aria-label="Remove file"
          >
            <XIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  // Fallback for unknown types
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border bg-gray-100 px-3 py-2 text-gray-500",
        className,
      )}
    >
      <File className="h-5 w-5 flex-shrink-0" />
      <span className="truncate text-xs">Unsupported file type</span>
      {removable && (
        <button
          type="button"
          className="ml-2 rounded-full bg-gray-200 p-1 text-gray-500 hover:bg-gray-300"
          onClick={onRemove}
          aria-label="Remove file"
        >
          <XIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
