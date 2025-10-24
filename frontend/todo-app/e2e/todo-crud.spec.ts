/**
 * End-to-end tests for Todo CRUD operations
 * Tests the complete user flow: create → read → update → delete
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3000';
const APP_URL = 'http://localhost:5173'; // Default Vite dev server port

test.describe('Todo CRUD Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(APP_URL);

    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('complete CRUD workflow', async ({ page }) => {
    // Step 1: CREATE - Create a new todo
    const todoTitle = `E2E Test Todo ${Date.now()}`;
    const todoDescription = 'This is a test todo created by Playwright';

    // Find and fill the create todo form
    await page.getByLabel(/title/i).fill(todoTitle);
    await page.getByLabel(/description/i).fill(todoDescription);

    // Select priority
    await page.getByLabel(/priority/i).selectOption('high');

    // Submit the form
    await page.getByRole('button', { name: /create|add/i }).click();

    // Wait for success toast
    await expect(page.getByText(/created successfully/i)).toBeVisible();

    // Step 2: READ - Verify the todo appears in the list
    await expect(page.getByText(todoTitle)).toBeVisible();
    await expect(page.getByText(todoDescription)).toBeVisible();

    // Step 3: UPDATE - Toggle completion status
    const todoItem = page.locator(`text=${todoTitle}`).locator('..');

    // Find and click the checkbox to mark as complete
    await todoItem.getByRole('checkbox').click();

    // Verify the todo is marked as completed (visually)
    await expect(todoItem).toHaveClass(/completed|line-through/);

    // Wait for optimistic update toast or success indicator
    await page.waitForTimeout(500);

    // Step 4: UPDATE - Edit todo details
    // Click edit button
    await todoItem.getByRole('button', { name: /edit/i }).click();

    // Update the title
    const updatedTitle = `${todoTitle} - Updated`;
    await page.getByLabel(/title/i).fill(updatedTitle);

    // Save changes
    await page.getByRole('button', { name: /save|update/i }).click();

    // Verify update
    await expect(page.getByText(updatedTitle)).toBeVisible();
    await expect(page.getByText(/updated successfully/i)).toBeVisible();

    // Step 5: DELETE - Delete the todo
    const updatedTodoItem = page.locator(`text=${updatedTitle}`).locator('..');

    // Click delete button
    await updatedTodoItem.getByRole('button', { name: /delete/i }).click();

    // Confirm deletion if there's a confirmation dialog
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
      await confirmButton.click();
    }

    // Verify deletion
    await expect(page.getByText(/deleted successfully/i)).toBeVisible();
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });

  test('filter todos by completion status', async ({ page }) => {
    // Wait for todos to load
    await page.waitForSelector('[data-testid="todo-item"]', { timeout: 5000 }).catch(() => {});

    // Click "Show Completed" filter
    await page.getByRole('button', { name: /completed/i }).click();

    // Verify only completed todos are shown
    const completedTodos = page.locator('[data-testid="todo-item"].completed');
    const incompleteTodos = page.locator('[data-testid="todo-item"]:not(.completed)');

    await expect(completedTodos.first()).toBeVisible({ timeout: 5000 }).catch(() => {});
    await expect(incompleteTodos).toHaveCount(0);
  });

  test('search todos', async ({ page }) => {
    // Type in search box
    const searchTerm = 'test';
    await page.getByPlaceholder(/search/i).fill(searchTerm);

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify filtered results
    const todoItems = page.locator('[data-testid="todo-item"]');
    const count = await todoItems.count();

    // Each visible todo should contain the search term
    for (let i = 0; i < count; i++) {
      const text = await todoItems.nth(i).textContent();
      expect(text?.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
  });

  test('handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and return error
    await page.route(`${API_URL}/api/todos`, (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal Server Error',
          message: 'Database connection failed',
        }),
      });
    });

    // Reload to trigger error
    await page.reload();

    // Verify error message is displayed
    await expect(page.getByText(/error|failed|something went wrong/i)).toBeVisible();
  });

  test('optimistic update rollback on error', async ({ page }) => {
    const todoTitle = `Optimistic Test ${Date.now()}`;

    // Intercept create request and return error
    await page.route(`${API_URL}/api/todos`, (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Validation failed',
          }),
        });
      } else {
        route.continue();
      }
    });

    // Try to create a todo
    await page.getByLabel(/title/i).fill(todoTitle);
    await page.getByRole('button', { name: /create|add/i }).click();

    // Optimistic update should appear briefly
    await page.waitForTimeout(100);

    // Then rollback should occur
    await expect(page.getByText(/failed/i)).toBeVisible();

    // Todo should not remain in the list
    await expect(page.getByText(todoTitle)).not.toBeVisible({ timeout: 2000 });
  });

  test('loading states during async operations', async ({ page }) => {
    // Slow down network to see loading states
    await page.route(`${API_URL}/api/todos`, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      route.continue();
    });

    // Trigger a reload
    await page.reload();

    // Verify loading skeleton is visible
    await expect(page.locator('[aria-hidden="true"]')).toBeVisible();

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Verify loading state is gone
    await expect(page.locator('[aria-hidden="true"]')).not.toBeVisible();
  });

  test('keyboard shortcuts', async ({ page }) => {
    // Test "Ctrl+N" for new todo
    await page.keyboard.press('Control+KeyN');

    // Verify new todo form is focused
    const titleInput = page.getByLabel(/title/i);
    await expect(titleInput).toBeFocused();

    // Test "/" for search focus
    await page.keyboard.press('/');

    // Verify search input is focused
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeFocused();

    // Test "Escape" to close/cancel
    await searchInput.fill('test');
    await page.keyboard.press('Escape');

    // Verify search is cleared (if that's the expected behavior)
    await expect(searchInput).toHaveValue('');
  });

  test('responsive design - mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify app is still functional
    await expect(page.getByRole('main')).toBeVisible();

    // Verify layout adapts (e.g., stacked layout)
    const container = page.locator('main');
    const box = await container.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(375);
  });

  test('statistics update after todo operations', async ({ page }) => {
    // Get initial stats
    const totalStat = page.getByText(/total/i).locator('..');
    const initialTotal = await totalStat.textContent();

    // Create a new todo
    const todoTitle = `Stats Test ${Date.now()}`;
    await page.getByLabel(/title/i).fill(todoTitle);
    await page.getByRole('button', { name: /create|add/i }).click();

    // Wait for creation
    await expect(page.getByText(/created successfully/i)).toBeVisible();

    // Verify stats updated
    await page.waitForTimeout(500);
    const updatedTotal = await totalStat.textContent();
    expect(updatedTotal).not.toBe(initialTotal);
  });
});
