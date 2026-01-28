"use client";

import { useEffect, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import { HelpSpotlight } from "./HelpSpotlight";
import { api } from "@/services/api";
import type { HelpItem } from "@/types/help";

export interface ContextualHelpProps {
  children: React.ReactNode;
  pageKey?: string; // Optional: filter help by page/route
  enabled?: boolean; // Allow disabling help system
}

const ELEMENT_WAIT_TIMEOUT = 5000; // 5 seconds
const ELEMENT_CHECK_INTERVAL = 100; // Check every 100ms

export function ContextualHelp({
  children,
  pageKey,
  enabled = true,
}: ContextualHelpProps) {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const [activeSpotlights, setActiveSpotlights] = useState<
    Map<string, { helpItem: HelpItem; targetElement: HTMLElement }>
  >(new Map());
  const [processedKeys, setProcessedKeys] = useState<Set<string>>(new Set());

  // Fetch help items for user
  // Backend handles filtering: auto_show=true, locale, category, dismissed items
  const { data: helpItems = [], isLoading } = useQuery({
    queryKey: ["help-for-user", locale, pageKey],
    queryFn: () => api.getHelpForUser({ 
      category: pageKey,  // Pass category to backend for filtering
      locale 
    }),
    enabled: enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  // Wait for target element to appear in DOM
  const waitForElement = useCallback(
    (selector: string): Promise<HTMLElement | null> => {
      return new Promise((resolve) => {
        const startTime = Date.now();

        const checkElement = () => {
          const element = document.querySelector(selector) as HTMLElement | null;

          if (element) {
            resolve(element);
            return;
          }

          if (Date.now() - startTime > ELEMENT_WAIT_TIMEOUT) {
            // Silently resolve null - this is expected when help items are for different pages
            // Only log in development for debugging purposes
            if (process.env.NODE_ENV === 'development') {
              console.debug(
                `Help target element not found: ${selector} (timeout after ${ELEMENT_WAIT_TIMEOUT}ms)`
              );
            }
            resolve(null);
            return;
          }

          setTimeout(checkElement, ELEMENT_CHECK_INTERVAL);
        };

        checkElement();
      });
    },
    []
  );

  // Process help items and show spotlights
  useEffect(() => {
    if (!enabled || isLoading || helpItems.length === 0) return;

    // Backend already filtered by:
    // - auto_show=true
    // - locale
    // - category (if pageKey provided)
    // - excluded dismissed items
    // So we just need to filter out already processed items
    const autoShowItems = helpItems.filter(
      (item) => !processedKeys.has(item.key)
    );

    // Process items sequentially
    const processItems = async () => {
      for (const helpItem of autoShowItems) {
        // Skip if already processed
        if (processedKeys.has(helpItem.key)) continue;

        // Wait for target element
        const targetElement = await waitForElement(helpItem.targetElement);

        if (targetElement) {
          setActiveSpotlights((prev) => {
            const next = new Map(prev);
            next.set(helpItem.key, { helpItem, targetElement });
            return next;
          });
          setProcessedKeys((prev) => new Set(prev).add(helpItem.key));
          // Wait for user to dismiss before showing next
          break; // Show one at a time
        } else {
          // Mark as processed even if element not found (to avoid retrying)
          setProcessedKeys((prev) => new Set(prev).add(helpItem.key));
        }
      }
    };

    processItems();
  }, [enabled, isLoading, helpItems, pageKey, processedKeys, waitForElement]);

  // Handle help dismissal
  const handleDismiss = useCallback(
    async (key: string) => {
      try {
        await api.dismissHelp(key);
        // Remove from active spotlights
        setActiveSpotlights((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        // Invalidate cache to get updated dismissed list
        queryClient.invalidateQueries({ 
          queryKey: ["help-for-user", locale, pageKey] 
        });
      } catch (error) {
        console.error("Failed to dismiss help:", error);
        // Still remove from UI even if API call fails
        setActiveSpotlights((prev) => {
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [queryClient, locale, pageKey]
  );

  // Handle skip all
  const handleSkipAll = useCallback(async () => {
    const keysToDismiss = Array.from(activeSpotlights.keys());
    await Promise.all(keysToDismiss.map((key) => handleDismiss(key)));
  }, [activeSpotlights, handleDismiss]);

  return (
    <>
      {children}
      {Array.from(activeSpotlights.values()).map(({ helpItem, targetElement }, index) => (
        <HelpSpotlight
          key={helpItem.key}
          helpItem={helpItem}
          targetElement={targetElement}
          onDismiss={() => handleDismiss(helpItem.key)}
          onSkipAll={
            activeSpotlights.size > 1 ? handleSkipAll : undefined
          }
          zIndex={9999 + index}
        />
      ))}
    </>
  );
}
