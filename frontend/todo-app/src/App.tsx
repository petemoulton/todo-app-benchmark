/**
 * Main App component with all providers
 * Sets up React Query, Toast notifications, and Error Boundary
 */

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ToastContainer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Import the main todo app component (to be created by frontend ticket)
// import { TodoApp } from '@/components/TodoApp';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Main app content goes here */}
            {/* <TodoApp /> */}
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Todo App - Integration Layer Ready
              </h1>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Integration Layer Complete
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ React Query setup with optimistic updates</li>
                  <li>✅ Type-safe API client matching backend spec</li>
                  <li>✅ Error boundary for error handling</li>
                  <li>✅ Toast notification system</li>
                  <li>✅ Loading skeleton screens</li>
                  <li>✅ Playwright E2E tests for full CRUD flow</li>
                  <li>✅ Environment variables configured</li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                  Ready for frontend components from Ticket #3 to be integrated.
                </p>
              </div>
            </div>
          </div>
          <ToastContainer />
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
