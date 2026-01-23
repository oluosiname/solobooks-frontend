"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@/components/atoms";
import type { HelpItem, HelpPosition } from "@/types/help";
import { cn } from "@/lib/utils";

export interface HelpSpotlightProps {
  helpItem: HelpItem;
  targetElement: HTMLElement | null;
  onDismiss: () => void;
  onSkipAll?: () => void;
  zIndex?: number;
}

export function HelpSpotlight({
  helpItem,
  targetElement,
  onDismiss,
  onSkipAll,
  zIndex = 9999,
}: HelpSpotlightProps) {
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<HelpPosition>(
    helpItem.position
  );
  const tooltipRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Calculate target element position
  useEffect(() => {
    if (!targetElement) return;

    const updatePosition = () => {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [targetElement]);

  // Calculate tooltip position
  useEffect(() => {
    if (!position || !tooltipRef.current) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust position if tooltip would go off-screen
    let adjustedPosition = helpItem.position;
    const spacing = 12;

    if (helpItem.position === "right" && position.left + position.width + tooltipRect.width + spacing > viewportWidth) {
      adjustedPosition = "left";
    } else if (helpItem.position === "left" && position.left - tooltipRect.width - spacing < 0) {
      adjustedPosition = "right";
    } else if (helpItem.position === "bottom" && position.top + position.height + tooltipRect.height + spacing > viewportHeight) {
      adjustedPosition = "top";
    } else if (helpItem.position === "top" && position.top - tooltipRect.height - spacing < 0) {
      adjustedPosition = "bottom";
    }

    setTooltipPosition(adjustedPosition);
  }, [position, helpItem.position]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onDismiss]);

  // Focus trap
  useEffect(() => {
    if (tooltipRef.current) {
      const focusableElements = tooltipRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      firstElement?.focus();
      tooltipRef.current.addEventListener("keydown", handleTab);

      return () => {
        tooltipRef.current?.removeEventListener("keydown", handleTab);
      };
    }
  }, []);

  if (!position || !targetElement) return null;

  // Calculate tooltip position relative to target
  const getTooltipStyle = (): React.CSSProperties => {
    const spacing = 12;
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: zIndex + 1,
    };

    switch (tooltipPosition) {
      case "top":
        return {
          ...baseStyle,
          bottom: `calc(100% + ${spacing}px)`,
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          ...baseStyle,
          top: `calc(100% + ${spacing}px)`,
          left: "50%",
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          ...baseStyle,
          right: `calc(100% + ${spacing}px)`,
          top: "50%",
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          ...baseStyle,
          left: `calc(100% + ${spacing}px)`,
          top: "50%",
          transform: "translateY(-50%)",
        };
    }
  };

  return (
    <>
      {/* Dark Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        style={{ zIndex }}
        aria-hidden="true"
      />

      {/* Highlighted Target Element */}
      <div
        className="fixed pointer-events-none transition-all"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          zIndex: zIndex + 1,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 3px rgb(59, 130, 246), 0 0 20px rgba(59, 130, 246, 0.5)",
          borderRadius: "8px",
        }}
        aria-hidden="true"
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-labelledby="help-title"
        aria-describedby="help-content"
        className="fixed bg-white rounded-lg shadow-xl p-4 max-w-sm animate-fade-in"
        style={getTooltipStyle()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3
              id="help-title"
              className="text-sm font-semibold text-slate-900 mb-1"
            >
              {helpItem.title}
            </h3>
            <p
              id="help-content"
              className="text-sm text-slate-600 mb-4"
            >
              {helpItem.content}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onDismiss}
                size="sm"
                className="flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                Got it
              </Button>
              {onSkipAll && (
                <Button
                  onClick={onSkipAll}
                  variant="ghost"
                  size="sm"
                >
                  Skip all
                </Button>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close help"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tooltip Arrow */}
        <div
          className={cn(
            "absolute w-2 h-2 bg-white transform rotate-45",
            tooltipPosition === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
            tooltipPosition === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
            tooltipPosition === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
            tooltipPosition === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
          )}
        />
      </div>
    </>
  );
}
