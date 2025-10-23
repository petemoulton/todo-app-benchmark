import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    filter: 'all' as const,
    onFilterChange: vi.fn(),
  };

  it('should render search input and filter buttons', () => {
    render(<SearchBar {...defaultProps} />);

    expect(screen.getByPlaceholderText(/search todos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
  });

  it('should call onSearchChange when typing in search input', async () => {
    const onSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} />);

    const searchInput = screen.getByPlaceholderText(/search todos/i);
    await userEvent.type(searchInput, 'test');

    expect(onSearchChange).toHaveBeenCalledWith('t');
    expect(onSearchChange).toHaveBeenCalledWith('te');
    expect(onSearchChange).toHaveBeenCalledWith('tes');
    expect(onSearchChange).toHaveBeenCalledWith('test');
  });

  it('should display current search query', () => {
    render(<SearchBar {...defaultProps} searchQuery="my search" />);

    const searchInput = screen.getByPlaceholderText(/search todos/i) as HTMLInputElement;
    expect(searchInput.value).toBe('my search');
  });

  it('should highlight active filter button', () => {
    render(<SearchBar {...defaultProps} filter="active" />);

    const activeButton = screen.getByRole('button', { name: /active/i });
    expect(activeButton).toHaveClass('bg-blue-600');
  });

  it('should call onFilterChange when filter button is clicked', async () => {
    const onFilterChange = vi.fn();
    render(<SearchBar {...defaultProps} onFilterChange={onFilterChange} />);

    const completedButton = screen.getByRole('button', { name: /completed/i });
    await userEvent.click(completedButton);

    expect(onFilterChange).toHaveBeenCalledWith('completed');
  });

  it('should show all filter as active by default', () => {
    render(<SearchBar {...defaultProps} />);

    const allButton = screen.getByRole('button', { name: /all/i });
    expect(allButton).toHaveClass('bg-blue-600');
  });

  it('should have correct styles for inactive filter buttons', () => {
    render(<SearchBar {...defaultProps} filter="all" />);

    const activeButton = screen.getByRole('button', { name: /active/i });
    expect(activeButton).toHaveClass('bg-white');
    expect(activeButton).toHaveClass('border-gray-300');
  });

  it('should allow switching between filters', async () => {
    const onFilterChange = vi.fn();
    const { rerender } = render(
      <SearchBar {...defaultProps} filter="all" onFilterChange={onFilterChange} />
    );

    await userEvent.click(screen.getByRole('button', { name: /active/i }));
    expect(onFilterChange).toHaveBeenCalledWith('active');

    rerender(<SearchBar {...defaultProps} filter="active" onFilterChange={onFilterChange} />);

    await userEvent.click(screen.getByRole('button', { name: /completed/i }));
    expect(onFilterChange).toHaveBeenCalledWith('completed');
  });

  it('should have search icon', () => {
    const { container } = render(<SearchBar {...defaultProps} />);

    const searchIcon = container.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
