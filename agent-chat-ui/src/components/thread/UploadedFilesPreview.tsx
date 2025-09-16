import React from "react";
import { File, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface UploadedFilesPreviewProps {
  files: UploadedFile[];
  onRemove?: (fileId: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const UploadedFilesPreview: React.FC<UploadedFilesPreviewProps> = ({
  files,
  onRemove,
  className,
  size = "md",
}) => {
  if (files.length === 0) return null;

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={cn("space-y-2", className)}>
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            "relative flex items-start gap-2 rounded-md border bg-blue-50 px-3 py-2",
            className,
          )}
        >
          <div className="flex flex-shrink-0 flex-col items-start justify-start">
            <File
              className={cn(
                getFileIconColor(file.type),
                size === "sm" ? "h-5 w-5" : "h-7 w-7",
              )}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-800">
              {file.originalName}
            </div>
            <div className="text-xs text-gray-500">
              {getFileTypeLabel(file.type)} • {formatFileSize(file.size)}
            </div>
            <div className="text-xs text-blue-600">
              📁 {file.filepath}
            </div>
          </div>
          {onRemove && (
            <button
              type="button"
              className="ml-2 self-start rounded-full bg-gray-200 p-1 text-gray-600 hover:bg-gray-300"
              onClick={() => onRemove(file.id)}
              aria-label="Remove file"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

