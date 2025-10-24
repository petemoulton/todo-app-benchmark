import type { TodoStats } from '@/types';

interface StatsProps {
  stats: TodoStats;
}

export function Stats({ stats }: StatsProps) {
  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>

      <div className="space-y-4">
        {/* Completion Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Completion Rate</span>
            <span className="text-sm font-semibold text-blue-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Count Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <div className="text-xs text-gray-500 mt-1">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">By Priority</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600">High</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.byPriority.high}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-yellow-500"></span>
                <span className="text-sm text-gray-600">Medium</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.byPriority.medium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-gray-500"></span>
                <span className="text-sm text-gray-600">Low</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.byPriority.low}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
