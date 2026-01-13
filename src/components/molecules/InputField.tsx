"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label, Input, type InputProps } from "@/components/atoms";

export interface InputFieldProps extends Omit<InputProps, "error"> {
  label: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, wrapperClassName, id, name, ...props }, ref) => {
    const fieldId = id || name;

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        <Input ref={ref} id={fieldId} name={name} error={!!error} {...props} />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
