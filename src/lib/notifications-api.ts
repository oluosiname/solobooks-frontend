/**
 * Notifications API Client
 *
 * Handles all notification-related API calls to the backend
 */

import { BaseApiClient } from "./base-api";

// ============================================
// Types
// ============================================

export interface NotificationData {
  id: string;
  notification_type: string;
  status: string;
  heading: string;
  message: string;
  link: string;
  read_at: string | null;
  sent_at: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationsListResponse {
  data: NotificationData[];
}

// ============================================
// API Client
// ============================================

class NotificationsApiClient extends BaseApiClient {
  /**
   * Get all notifications
   * GET /api/v1/notifications
   */
  async getNotifications(): Promise<NotificationsListResponse> {
    return this.get<NotificationsListResponse>("/api/v1/notifications");
  }

  /**
   * Mark notification as read
   * PATCH /api/v1/notifications/{id}/read
   */
  async markAsRead(id: string): Promise<void> {
    return this.patch<void>(`/api/v1/notifications/${id}/read`);
  }

  /**
   * Mark all notifications as read
   * PATCH /api/v1/notifications/read_all
   */
  async markAllAsRead(): Promise<void> {
    return this.patch<void>("/api/v1/notifications/read_all");
  }
}

export const notificationsApi = new NotificationsApiClient();
