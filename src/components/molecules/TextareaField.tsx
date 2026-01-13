"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label, Textarea, type TextareaProps } from "@/components/atoms";

export interface TextareaFieldProps extends Omit<TextareaProps, "error"> {
  label: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export const TextareaField = forwardRef<
  HTMLTextAreaElement,
  TextareaFieldProps
>(({ label, error, required, wrapperClassName, id, name, ...props }, ref) => {
  const fieldId = id || name;

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <Label htmlFor={fieldId} required={required}>
        {label}
      </Label>
      <Textarea ref={ref} id={fieldId} name={name} error={!!error} {...props} />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

TextareaField.displayName = "TextareaField";
