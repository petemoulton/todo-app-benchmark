import { useState, useEffect, useMemo } from 'react';
import {
  CreateTodo,
  SearchBar,
  TodoList,
  Stats,
  LoadingSkeleton,
} from './components';
import type { Todo, CreateTodoInput, UpdateTodoInput, TodoFilter } from './types';
import { mockTodos } from './utils/mockData';
import { filterTodos, searchTodos, calculateStats } from './utils/helpers';

/**
 * Main TodoApp component
 * Manages all todo state and operations with mock data
 * For integration with backend API, see Ticket #4
 */
export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial data load
  useEffect(() => {
    const timer = setTimeout(() => {
      setTodos(mockTodos);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Focus search on '/' key
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        document.getElementById('search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Create todo
  const handleCreate = (data: CreateTodoInput) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      completed: false,
      priority: data.priority,
      due_date: data.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setTodos((prev) => [newTodo, ...prev]);
  };

  // Update todo
  const handleUpdate = (id: string, data: UpdateTodoInput) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              ...data,
              updated_at: new Date().toISOString(),
            }
          : todo
      )
    );
  };

  // Delete todo
  const handleDelete = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  // Toggle completion
  const handleToggle = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              completed: !todo.completed,
              updated_at: new Date().toISOString(),
            }
          : todo
      )
    );
  };

  // Clear completed todos
  const handleClearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  // Compute filtered and searched todos
  const displayedTodos = useMemo(() => {
    let result = todos;
    result = filterTodos(result, filter);
    result = searchTodos(result, searchQuery);
    return result;
  }, [todos, filter, searchQuery]);

  // Compute stats
  const stats = useMemo(() => calculateStats(todos), [todos]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo App</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your tasks efficiently. Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">/</kbd> to search
          </p>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Todo List */}
          <div className="lg:col-span-2 space-y-6">
            <CreateTodo onCreate={handleCreate} />

            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filter={filter}
              onFilterChange={setFilter}
            />

            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <TodoList
                todos={displayedTodos}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onToggle={handleToggle}
                onClearCompleted={handleClearCompleted}
              />
            )}
          </div>

          {/* Right Column - Stats */}
          <div>
            <div className="sticky top-8">
              <Stats stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
