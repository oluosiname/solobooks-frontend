"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label, Select, type SelectProps } from "@/components/atoms";

export interface SelectFieldProps extends Omit<SelectProps, "error"> {
  label: string;
  error?: string;
  required?: boolean;
  wrapperClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, required, wrapperClassName, id, name, ...props }, ref) => {
    const fieldId = id || name;

    return (
      <div className={cn("space-y-1.5", wrapperClassName)}>
        <Label htmlFor={fieldId} required={required}>
          {label}
        </Label>
        <Select ref={ref} id={fieldId} name={name} error={!!error} {...props} />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

SelectField.displayName = "SelectField";
