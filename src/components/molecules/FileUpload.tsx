"use client";

import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileUploadProps {
  accept?: string;
  maxSize?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  accept,
  maxSize = "10MB",
  onFileSelect,
  className,
  label,
  description,
}: FileUploadProps) {
  const handleClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    if (accept) input.accept = accept;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && onFileSelect) {
        onFileSelect(file);
      }
    };
    input.click();
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 px-6 py-10 transition-colors hover:border-slate-400",
        className
      )}
    >
      <Upload className="h-8 w-8 text-slate-400" />
      <p className="mt-2 text-sm text-slate-600">
        {label || "Click to upload or drag and drop"}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {description || `PDF, PNG, JPG up to ${maxSize}`}
      </p>
    </div>
  );
}
