import { useState, useRef, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";
import type { Base64ContentBlock } from "@langchain/core/messages";

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  filepath: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

interface UseFileUploadWithServerOptions {
  onFileUploaded?: (file: UploadedFile) => void;
}

export function useFileUploadWithServer({
  onFileUploaded,
}: UseFileUploadWithServerOptions = {}) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const dragCounter = useRef(0);

  const uploadFileToServer = async (file: File): Promise<UploadedFile | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        filename: result.filename,
        originalName: result.originalName,
        filepath: result.filepath,
        size: result.size,
        type: result.type,
        uploadedAt: new Date(),
      };

      return uploadedFile;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const fileArray = Array.from(files);
    
    try {
      const uploadPromises = fileArray.map(uploadFileToServer);
      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter((file): file is UploadedFile => file !== null);
      
      if (successfulUploads.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulUploads]);
        
        // 调用回调函数，通知父组件文件已上传
        successfulUploads.forEach(file => {
          onFileUploaded?.(file);
        });
        
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // 拖拽上传处理
  useEffect(() => {
    if (!dropRef.current) return;

    const handleWindowDragEnter = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter.current += 1;
        setDragOver(true);
      }
    };

    const handleWindowDragLeave = (e: DragEvent) => {
      if (e.dataTransfer?.types?.includes("Files")) {
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
          setDragOver(false);
          dragCounter.current = 0;
        }
      }
    };

    const handleWindowDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setDragOver(false);

      if (!e.dataTransfer) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      setIsUploading(true);
      
      try {
        const uploadPromises = files.map(uploadFileToServer);
        const results = await Promise.all(uploadPromises);
        
        const successfulUploads = results.filter((file): file is UploadedFile => file !== null);
        
        if (successfulUploads.length > 0) {
          setUploadedFiles(prev => [...prev, ...successfulUploads]);
          
          successfulUploads.forEach(file => {
            onFileUploaded?.(file);
          });
          
          toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
        }
      } finally {
        setIsUploading(false);
      }
    };

    const handleWindowDragEnd = (e: DragEvent) => {
      dragCounter.current = 0;
      setDragOver(false);
    };

    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
    };

    // 添加事件监听器
    window.addEventListener("dragenter", handleWindowDragEnter);
    window.addEventListener("dragleave", handleWindowDragLeave);
    window.addEventListener("drop", handleWindowDrop);
    window.addEventListener("dragend", handleWindowDragEnd);
    window.addEventListener("dragover", handleWindowDragOver);

    const element = dropRef.current;
    element.addEventListener("dragover", handleDragOver);
    element.addEventListener("dragenter", handleDragEnter);
    element.addEventListener("dragleave", handleDragLeave);

    return () => {
      element.removeEventListener("dragover", handleDragOver);
      element.removeEventListener("dragenter", handleDragEnter);
      element.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragenter", handleWindowDragEnter);
      window.removeEventListener("dragleave", handleWindowDragLeave);
      window.removeEventListener("drop", handleWindowDrop);
      window.removeEventListener("dragend", handleWindowDragEnd);
      window.removeEventListener("dragover", handleWindowDragOver);
      dragCounter.current = 0;
    };
  }, [onFileUploaded]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const clearFiles = () => {
    setUploadedFiles([]);
  };

  return {
    uploadedFiles,
    isUploading,
    handleFileUpload,
    dropRef,
    removeFile,
    clearFiles,
    dragOver,
  };
}

