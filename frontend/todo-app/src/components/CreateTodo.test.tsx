import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTodo } from './CreateTodo';

describe('CreateTodo', () => {
  it('should render form with all fields', () => {
    render(<CreateTodo onCreate={vi.fn()} />);

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('should call onCreate with form data when submitted', async () => {
    const onCreate = vi.fn();
    render(<CreateTodo onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'New Todo');
    await userEvent.type(screen.getByLabelText(/description/i), 'Todo description');
    await userEvent.selectOptions(screen.getByLabelText(/priority/i), 'high');

    const submitButton = screen.getByRole('button', { name: /create todo/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        title: 'New Todo',
        description: 'Todo description',
        priority: 'high',
        due_date: undefined,
      });
    });
  });

  it('should require title field', async () => {
    const onCreate = vi.fn();
    render(<CreateTodo onCreate={onCreate} />);

    const submitButton = screen.getByRole('button', { name: /create todo/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should validate title length', async () => {
    const onCreate = vi.fn();
    render(<CreateTodo onCreate={onCreate} />);

    const longTitle = 'a'.repeat(501);
    await userEvent.type(screen.getByLabelText(/title/i), longTitle);

    const submitButton = screen.getByRole('button', { name: /create todo/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title must be 500 characters or less/i)).toBeInTheDocument();
    });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should validate description length', async () => {
    const onCreate = vi.fn();
    render(<CreateTodo onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'Valid title');
    const longDescription = 'a'.repeat(5001);
    await userEvent.type(screen.getByLabelText(/description/i), longDescription);

    const submitButton = screen.getByRole('button', { name: /create todo/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/description must be 5000 characters or less/i)).toBeInTheDocument();
    });

    expect(onCreate).not.toHaveBeenCalled();
  });

  it('should reset form after successful submission', async () => {
    const onCreate = vi.fn();
    render(<CreateTodo onCreate={onCreate} />);

    const titleInput = screen.getByLabelText(/title/i);
    await userEvent.type(titleInput, 'New Todo');

    const submitButton = screen.getByRole('button', { name: /create todo/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalled();
    });

    // Form should be reset
    expect(titleInput).toHaveValue('');
  });

  it('should clear form when clear button is clicked', async () => {
    render(<CreateTodo onCreate={vi.fn()} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'New Todo');
    await userEvent.type(screen.getByLabelText(/description/i), 'Description');

    const clearButton = screen.getByRole('button', { name: /clear/i });
    await userEvent.click(clearButton);

    expect(screen.getByLabelText(/title/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
  });

  it('should have medium priority selected by default', () => {
    render(<CreateTodo onCreate={vi.fn()} />);

    const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement;
    expect(prioritySelect.value).toBe('medium');
  });

  it('should handle optional fields correctly', async () => {
    const onCreate = vi.fn();
    render(<CreateTodo onCreate={onCreate} />);

    await userEvent.type(screen.getByLabelText(/title/i), 'Minimal Todo');

    const submitButton = screen.getByRole('button', { name: /create todo/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledWith({
        title: 'Minimal Todo',
        description: undefined,
        priority: 'medium',
        due_date: undefined,
      });
    });
  });

  it('should set minimum date to today', () => {
    render(<CreateTodo onCreate={vi.fn()} />);

    const dateInput = screen.getByLabelText(/due date/i) as HTMLInputElement;
    const today = new Date().toISOString().split('T')[0];

    expect(dateInput.min).toBe(today);
  });
});
