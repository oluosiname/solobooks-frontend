"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardPromptCard } from "@/components/molecules/DashboardPromptCard";
import { api } from "@/services/api";
import type { PromptCard } from "@/types/help";

export function DashboardPromptCards() {
  const queryClient = useQueryClient();

  const { data: dashboardStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: api.fetchDashboardStats,
  });

  const handleDismiss = async (key: string) => {
    try {
      await api.dismissPromptCard(key);
      // Invalidate to get updated prompt cards
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error) {
      console.error("Failed to dismiss prompt card:", error);
    }
  };

  const promptCards = dashboardStats?.promptCards || [];

  if (promptCards.length === 0) return null;

  return (
    <div className="space-y-4">
      {promptCards.map((card) => (
        <DashboardPromptCard
          key={card.key}
          card={card}
          onDismiss={handleDismiss}
        />
      ))}
    </div>
  );
}
