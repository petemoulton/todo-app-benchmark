-- Migration: Create todo_app schema and todos table
-- Version: 001
-- Created: 2025-10-21

-- Create schema
CREATE SCHEMA IF NOT EXISTS todo_app;

-- Create todos table
CREATE TABLE IF NOT EXISTS todo_app.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todo_app.todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todo_app.todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todo_app.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todo_app.todos(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION todo_app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todo_app.todos
    FOR EACH ROW EXECUTE FUNCTION todo_app.update_updated_at_column();

-- Grant permissions (if needed)
GRANT USAGE ON SCHEMA todo_app TO blockbase;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA todo_app TO blockbase;
