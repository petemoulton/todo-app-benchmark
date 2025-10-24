import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stats } from './Stats';
import type { TodoStats } from '@/types';

describe('Stats', () => {
  const mockStats: TodoStats = {
    total: 10,
    completed: 4,
    active: 6,
    byPriority: {
      low: 3,
      medium: 4,
      high: 3,
    },
  };

  it('should render all statistics', () => {
    render(<Stats stats={mockStats} />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('should display completion rate', () => {
    render(<Stats stats={mockStats} />);

    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('should display priority breakdown', () => {
    render(<Stats stats={mockStats} />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();

    // Count values
    const priorityValues = screen.getAllByText('3');
    expect(priorityValues).toHaveLength(2); // High and Low both have 3
    expect(screen.getAllByText('4')).toHaveLength(2); // Medium has 4, completed also shows 4
  });

  it('should show 0% completion when no todos', () => {
    const emptyStats: TodoStats = {
      total: 0,
      completed: 0,
      active: 0,
      byPriority: { low: 0, medium: 0, high: 0 },
    };

    render(<Stats stats={emptyStats} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should show 100% completion when all completed', () => {
    const completedStats: TodoStats = {
      total: 5,
      completed: 5,
      active: 0,
      byPriority: { low: 2, medium: 2, high: 1 },
    };

    render(<Stats stats={completedStats} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render progress bar with correct width', () => {
    const { container } = render(<Stats stats={mockStats} />);

    const progressBar = container.querySelector('.bg-blue-600');
    expect(progressBar).toHaveStyle({ width: '40%' });
  });

  it('should round completion percentage correctly', () => {
    const oddStats: TodoStats = {
      total: 3,
      completed: 1,
      active: 2,
      byPriority: { low: 1, medium: 1, high: 1 },
    };

    render(<Stats stats={oddStats} />);

    // 1/3 = 33.33%, should round to 33%
    expect(screen.getByText('33%')).toBeInTheDocument();
  });

  it('should display labels for stat categories', () => {
    render(<Stats stats={mockStats} />);

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('By Priority')).toBeInTheDocument();
  });

  it('should have priority color indicators', () => {
    const { container } = render(<Stats stats={mockStats} />);

    const colorIndicators = container.querySelectorAll('.inline-block.w-3.h-3.rounded-full');
    expect(colorIndicators).toHaveLength(3); // One for each priority
  });
});
