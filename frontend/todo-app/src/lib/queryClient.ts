/**
 * React Query client configuration
 * Centralized query client setup with error handling and caching strategy
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    // Disable automatic refetching on window focus in development
    refetchOnWindowFocus: false,
    // Retry failed requests up to 3 times with exponential backoff
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
    // Cache data for 5 minutes
    staleTime: 1000 * 60 * 5,
    // Keep unused data in cache for 10 minutes
    cacheTime: 1000 * 60 * 10,
  },
  mutations: {
    // Retry mutations once (for network errors)
    retry: 1,
  },
};

export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query keys for type-safe cache invalidation
 */
export const queryKeys = {
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (filters?: {
      completed?: boolean;
      priority?: string;
      search?: string;
    }) => [...queryKeys.todos.lists(), filters] as const,
    details: () => [...queryKeys.todos.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.todos.details(), id] as const,
  },
  stats: {
    all: ['stats'] as const,
  },
} as const;
