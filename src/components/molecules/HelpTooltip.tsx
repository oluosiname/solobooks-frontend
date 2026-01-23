"use client";

import { useEffect, useState, useRef } from "react";
import { X, HelpCircle } from "lucide-react";
import type { HelpItem, HelpPosition } from "@/types/help";

export interface HelpTooltipProps {
  helpItem: HelpItem;
  targetElement: HTMLElement | null;
  position?: HelpPosition;
  onClose: () => void;
}

export function HelpTooltip({
  helpItem,
  targetElement,
  position = "bottom",
  onClose,
}: HelpTooltipProps) {
  const [tooltipPosition, setTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      const tooltipRect = tooltip.getBoundingClientRect();
      const spacing = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = rect.top - tooltipRect.height - spacing;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + spacing;
          left = rect.left + rect.width / 2 - tooltipRect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.left - tooltipRect.width - spacing;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipRect.height / 2;
          left = rect.right + spacing;
          break;
      }

      // Adjust if off-screen
      if (left < 0) left = 8;
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 8;
      }
      if (top < 0) top = 8;
      if (top + tooltipRect.height > window.innerHeight) {
        top = window.innerHeight - tooltipRect.height - 8;
      }

      setTooltipPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [targetElement, position]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!targetElement || !tooltipPosition) return null;

  return (
    <div
      ref={tooltipRef}
      role="tooltip"
      aria-labelledby="tooltip-title"
      className="fixed bg-white rounded-lg shadow-lg p-3 max-w-xs z-[10000] border border-slate-200"
      style={{
        top: tooltipPosition.top,
        left: tooltipPosition.left,
      }}
    >
      <div className="flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4
            id="tooltip-title"
            className="text-sm font-semibold text-slate-900 mb-1"
          >
            {helpItem.title}
          </h4>
          <p className="text-xs text-slate-600">{helpItem.content}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          aria-label="Close tooltip"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
