"use client";

import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/atoms";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertBannerProps {
  variant?: AlertVariant;
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

const iconMap: Record<AlertVariant, typeof AlertCircle> = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
};

export function AlertBanner({
  variant = "info",
  title,
  message,
  action,
  onDismiss,
  className,
}: AlertBannerProps) {
  const Icon = iconMap[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-4",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className={cn(title && "mt-1")}>{message}</p>
      </div>
      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="flex-shrink-0"
        >
          {action.label}
        </Button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded p-1 hover:bg-black/5"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
