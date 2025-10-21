-- Todo App Seed Data
-- Version: 1.0.0
-- Created: 2025-10-21
-- Project: todo-app-benchmark

-- Set search path
SET search_path TO todo_app, public;

-- Seed 10 diverse example todos
-- Mix of: completed/incomplete, different priorities, with/without due dates

INSERT INTO todo_app.todos (title, description, completed, priority, due_date) VALUES
    -- Completed todos (4)
    (
        'Set up development environment',
        'Install Node.js, PostgreSQL, and configure local development tools. Update environment variables and verify database connection.',
        true,
        'high',
        NOW() - INTERVAL '3 days'
    ),
    (
        'Review PRD documentation',
        'Read through the Product Requirements Document to understand project scope, technical architecture, and acceptance criteria.',
        true,
        'medium',
        NOW() - INTERVAL '5 days'
    ),
    (
        'Update team on project status',
        NULL, -- No description
        true,
        'low',
        NOW() - INTERVAL '1 day'
    ),
    (
        'Fix minor CSS styling issues',
        'Adjust padding on header component and fix mobile responsiveness for navigation menu.',
        true,
        'low',
        NOW() - INTERVAL '2 days'
    ),

    -- Incomplete todos (6)
    (
        'Implement todo filtering UI',
        'Create filter controls for completion status and priority. Add search functionality for title/description full-text search.',
        false,
        'high',
        NOW() + INTERVAL '2 days'
    ),
    (
        'Write comprehensive API tests',
        'Achieve >80% test coverage for backend. Include unit tests for all endpoints, integration tests for database queries, and error handling scenarios.',
        false,
        'high',
        NOW() + INTERVAL '5 days'
    ),
    (
        'Optimize database queries',
        'Review slow query log, add missing indexes, and ensure all queries use proper EXPLAIN ANALYZE for performance validation.',
        false,
        'medium',
        NOW() + INTERVAL '7 days'
    ),
    (
        'Refactor authentication middleware',
        NULL, -- No description
        false,
        'medium',
        NULL -- No due date
    ),
    (
        'Plan team building event',
        'Research venue options, create budget proposal, and send calendar invites. Consider outdoor activities for September weather.',
        false,
        'low',
        NOW() + INTERVAL '14 days'
    ),
    (
        'Explore dark mode implementation',
        'Research best practices for Tailwind CSS dark mode. Consider user preference detection and toggle persistence.',
        false,
        'low',
        NULL -- No due date
    );

-- Verify seed data was inserted
DO $$
DECLARE
    todo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO todo_count FROM todo_app.todos;
    RAISE NOTICE 'Seed data complete: % todos inserted', todo_count;

    -- Log statistics
    RAISE NOTICE 'Completed: %', (SELECT COUNT(*) FROM todo_app.todos WHERE completed = true);
    RAISE NOTICE 'Incomplete: %', (SELECT COUNT(*) FROM todo_app.todos WHERE completed = false);
    RAISE NOTICE 'High priority: %', (SELECT COUNT(*) FROM todo_app.todos WHERE priority = 'high');
    RAISE NOTICE 'Medium priority: %', (SELECT COUNT(*) FROM todo_app.todos WHERE priority = 'medium');
    RAISE NOTICE 'Low priority: %', (SELECT COUNT(*) FROM todo_app.todos WHERE priority = 'low');
    RAISE NOTICE 'With due dates: %', (SELECT COUNT(*) FROM todo_app.todos WHERE due_date IS NOT NULL);
END $$;
