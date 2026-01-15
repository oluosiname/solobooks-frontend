/**
 * Toast Notification Utilities
 *
 * Centralized toast notifications with consistent messaging
 */

import toast from 'react-hot-toast';
import type { AppError } from '@/lib/base-api';

export const showToast = {
  // Success messages
  success: (message: string) => {
    toast.success(message);
  },

  // Error messages
  error: (message: string) => {
    toast.error(message);
  },

  // API Error handler
  apiError: (error: AppError, defaultMessage: string = 'An error occurred') => {
    const message = error?.error?.message || defaultMessage;
    toast.error(message);
  },

  // Common CRUD operations
  created: (resource: string) => {
    toast.success(`${resource} created successfully`);
  },

  updated: (resource: string) => {
    toast.success(`${resource} updated successfully`);
  },

  deleted: (resource: string) => {
    toast.success(`${resource} deleted successfully`);
  },

  // Loading toast (returns toast id to dismiss later)
  loading: (message: string) => {
    return toast.loading(message);
  },

  // Dismiss a specific toast
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  // Promise-based toast for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};
