import type { Todo, UpdateTodoInput } from '@/types';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, data: UpdateTodoInput) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onClearCompleted: () => void;
}

export function TodoList({
  todos,
  onUpdate,
  onDelete,
  onToggle,
  onClearCompleted,
}: TodoListProps) {
  const hasCompleted = todos.some((todo) => todo.completed);

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No todos found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new todo above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Todos ({todos.length})
        </h2>
        {hasCompleted && (
          <button
            onClick={onClearCompleted}
            className="text-sm text-red-600 hover:text-red-700 font-medium focus:outline-none focus:underline"
          >
            Clear Completed
          </button>
        )}
      </div>

      <div className="space-y-3">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
