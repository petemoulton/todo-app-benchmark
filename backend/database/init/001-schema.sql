-- Todo App Database Schema
-- Version: 1.0.0
-- Created: 2025-10-21
-- Project: todo-app-benchmark
-- Pattern: Blockbase architectural pattern

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search on title/description

-- Create application schema
CREATE SCHEMA IF NOT EXISTS todo_app;

-- Set search path
SET search_path TO todo_app, public;

-- Todos table
-- Simplified schema without authentication (local-only app)
CREATE TABLE todo_app.todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT description_max_length CHECK (description IS NULL OR length(description) <= 5000)
);

-- Create indexes for performance
CREATE INDEX idx_todos_completed ON todo_app.todos(completed);
CREATE INDEX idx_todos_priority ON todo_app.todos(priority);
CREATE INDEX idx_todos_due_date ON todo_app.todos(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_todos_created_at ON todo_app.todos(created_at DESC);

-- Full-text search index for title and description
CREATE INDEX idx_todos_search ON todo_app.todos USING gin(to_tsvector('english',
    coalesce(title, '') || ' ' || coalesce(description, '')
));

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION todo_app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update timestamp trigger
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todo_app.todos
    FOR EACH ROW
    EXECUTE FUNCTION todo_app.update_updated_at_column();

-- Grant permissions (for local development)
GRANT USAGE ON SCHEMA todo_app TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA todo_app TO PUBLIC;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA todo_app TO PUBLIC;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA todo_app TO PUBLIC;

-- Comments for documentation
COMMENT ON SCHEMA todo_app IS 'Todo application data schema';
COMMENT ON TABLE todo_app.todos IS 'Main todos table - stores all todo items';
COMMENT ON COLUMN todo_app.todos.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN todo_app.todos.title IS 'Todo title (1-500 characters, required)';
COMMENT ON COLUMN todo_app.todos.description IS 'Optional detailed description (max 5000 characters)';
COMMENT ON COLUMN todo_app.todos.completed IS 'Completion status (default: false)';
COMMENT ON COLUMN todo_app.todos.priority IS 'Priority level: low, medium, or high (default: medium)';
COMMENT ON COLUMN todo_app.todos.due_date IS 'Optional due date/time';
COMMENT ON COLUMN todo_app.todos.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN todo_app.todos.updated_at IS 'Last update timestamp (auto-updated)';
