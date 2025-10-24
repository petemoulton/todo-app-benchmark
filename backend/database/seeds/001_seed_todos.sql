-- Seed Data: 10 example todos
-- Version: 001
-- Created: 2025-10-21

-- Clear existing data (for development)
TRUNCATE TABLE todo_app.todos CASCADE;

-- Insert 10 example todos with variety
INSERT INTO todo_app.todos (title, description, completed, priority, due_date) VALUES
('Complete project documentation', 'Write comprehensive README and API docs', false, 'high', NOW() + INTERVAL '2 days'),
('Fix authentication bug', 'Users cannot login with special characters in password', false, 'high', NOW() + INTERVAL '1 day'),
('Review pull requests', 'Review and merge pending PRs from team', false, 'medium', NOW() + INTERVAL '3 days'),
('Update dependencies', 'npm audit fix and update to latest versions', false, 'low', NOW() + INTERVAL '7 days'),
('Team standup meeting', 'Daily sync with development team', true, 'medium', NOW() - INTERVAL '1 day'),
('Write unit tests', 'Add test coverage for new API endpoints', false, 'high', NOW() + INTERVAL '2 days'),
('Design new landing page', 'Create mockups for marketing site redesign', false, 'low', NOW() + INTERVAL '14 days'),
('Database backup', 'Set up automated daily backups to S3', true, 'medium', NULL),
('Code review guidelines', 'Document team code review process', true, 'low', NULL),
('Optimize database queries', 'Profile and improve slow queries in production', false, 'medium', NOW() + INTERVAL '5 days');

-- Verify seeded data
SELECT
    COUNT(*) as total_todos,
    SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN NOT completed THEN 1 ELSE 0 END) as active_count
FROM todo_app.todos;
