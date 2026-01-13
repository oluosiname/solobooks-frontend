"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  backButton?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  backButton,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className={cn("mb-6 flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        {backButton && (
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
