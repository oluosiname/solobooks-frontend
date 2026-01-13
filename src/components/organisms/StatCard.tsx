"use client";

import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/atoms";

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
            {change && (
              <div
                className={cn(
                  "mt-2 flex items-center gap-1 text-sm",
                  changeType === "positive" && "text-emerald-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-slate-500"
                )}
              >
                {changeType === "positive" && (
                  <TrendingUp className="h-4 w-4" />
                )}
                {changeType === "negative" && (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-slate-100 p-2">
              <Icon className="h-5 w-5 text-slate-600" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
