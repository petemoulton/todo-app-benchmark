/**
 * Hook for using toast notifications
 * Convenience wrapper around ToastContext
 */

import { useToastContext } from '@/contexts/ToastContext';

export function useToast() {
  return useToastContext();
}
