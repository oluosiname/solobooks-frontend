"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors resize-none",
          "focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
            : "border-slate-200",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
