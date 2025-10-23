/**
 * React Query hooks for Todo operations
 * Implements optimistic updates and cache invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { queryKeys } from '@/lib/queryClient';
import type {
  Todo,
  CreateTodoRequest,
  UpdateTodoRequest,
  TodoFilters,
} from '@/shared/types';
import { useToast } from '@/hooks/useToast';

/**
 * Hook to fetch todos with filters
 */
export function useTodos(filters?: TodoFilters) {
  return useQuery({
    queryKey: queryKeys.todos.list(filters),
    queryFn: () => apiClient.getTodos(filters),
  });
}

/**
 * Hook to fetch a single todo by ID
 */
export function useTodo(id: string) {
  return useQuery({
    queryKey: queryKeys.todos.detail(id),
    queryFn: () => apiClient.getTodo(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch todo statistics
 */
export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats.all,
    queryFn: () => apiClient.getStats(),
  });
}

/**
 * Hook to create a new todo with optimistic update
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => apiClient.createTodo(data),
    onMutate: async (newTodo) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.lists() });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(queryKeys.todos.lists());

      // Optimistically update cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.todos.lists() },
        (old: any) => {
          if (!old) return old;

          const optimisticTodo: Todo = {
            id: `temp-${Date.now()}`,
            title: newTodo.title,
            description: newTodo.description || null,
            completed: false,
            priority: newTodo.priority || 'medium',
            due_date: newTodo.due_date || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          return {
            ...old,
            todos: [optimisticTodo, ...old.todos],
            total: old.total + 1,
          };
        }
      );

      return { previousTodos };
    },
    onError: (error, _newTodo, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.todos.lists() },
          context.previousTodos
        );
      }
      showError(error instanceof Error ? error.message : 'Failed to create todo');
    },
    onSuccess: () => {
      showSuccess('Todo created successfully');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook to update a todo with optimistic update
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      apiClient.updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.lists() });

      // Snapshot previous values
      const previousTodo = queryClient.getQueryData(queryKeys.todos.detail(id));
      const previousTodos = queryClient.getQueryData(queryKeys.todos.lists());

      // Optimistically update detail
      queryClient.setQueryData(queryKeys.todos.detail(id), (old: Todo | undefined) => {
        if (!old) return old;
        return { ...old, ...data, updated_at: new Date().toISOString() };
      });

      // Optimistically update lists
      queryClient.setQueriesData(
        { queryKey: queryKeys.todos.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            todos: old.todos.map((todo: Todo) =>
              todo.id === id
                ? { ...todo, ...data, updated_at: new Date().toISOString() }
                : todo
            ),
          };
        }
      );

      return { previousTodo, previousTodos };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousTodo) {
        queryClient.setQueryData(queryKeys.todos.detail(id), context.previousTodo);
      }
      if (context?.previousTodos) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.todos.lists() },
          context.previousTodos
        );
      }
      showError(error instanceof Error ? error.message : 'Failed to update todo');
    },
    onSuccess: () => {
      showSuccess('Todo updated successfully');
    },
    onSettled: (_data, _error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook to delete a todo with optimistic update
 */
export function useDeleteTodo() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTodo(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.lists() });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData(queryKeys.todos.lists());

      // Optimistically remove from cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.todos.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            todos: old.todos.filter((todo: Todo) => todo.id !== id),
            total: old.total - 1,
          };
        }
      );

      return { previousTodos };
    },
    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.todos.lists() },
          context.previousTodos
        );
      }
      showError(error instanceof Error ? error.message : 'Failed to delete todo');
    },
    onSuccess: () => {
      showSuccess('Todo deleted successfully');
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook to toggle todo completion status
 */
export function useToggleTodo() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => apiClient.toggleTodo(id),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.detail(id) });
      await queryClient.cancelQueries({ queryKey: queryKeys.todos.lists() });

      // Snapshot previous values
      const previousTodo = queryClient.getQueryData(queryKeys.todos.detail(id));
      const previousTodos = queryClient.getQueryData(queryKeys.todos.lists());

      // Optimistically toggle
      queryClient.setQueryData(queryKeys.todos.detail(id), (old: Todo | undefined) => {
        if (!old) return old;
        return { ...old, completed: !old.completed, updated_at: new Date().toISOString() };
      });

      queryClient.setQueriesData(
        { queryKey: queryKeys.todos.lists() },
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            todos: old.todos.map((todo: Todo) =>
              todo.id === id
                ? { ...todo, completed: !todo.completed, updated_at: new Date().toISOString() }
                : todo
            ),
          };
        }
      );

      return { previousTodo, previousTodos };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousTodo) {
        queryClient.setQueryData(queryKeys.todos.detail(id), context.previousTodo);
      }
      if (context?.previousTodos) {
        queryClient.setQueriesData(
          { queryKey: queryKeys.todos.lists() },
          context.previousTodos
        );
      }
      showError(error instanceof Error ? error.message : 'Failed to toggle todo');
    },
    onSettled: (_data, _error, id) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
  });
}

/**
 * Hook to delete all completed todos
 */
export function useDeleteCompleted() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: () => apiClient.deleteCompleted(),
    onSuccess: (data) => {
      showSuccess(`${data.deleted} completed todo(s) deleted`);
      queryClient.invalidateQueries({ queryKey: queryKeys.todos.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats.all });
    },
    onError: (error) => {
      showError(error instanceof Error ? error.message : 'Failed to delete completed todos');
    },
  });
}
