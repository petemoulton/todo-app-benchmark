# Todo App Database

PostgreSQL database setup for the todo-app-benchmark project.

## Quick Start

```bash
# Start database
docker-compose up -d postgres

# Check database health
docker exec todo-app-postgres pg_isready -U blockbase -d todo_app

# View logs
docker logs -f todo-app-postgres

# Stop database
docker-compose stop postgres

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d postgres
```

## Connection Details

- **Host**: localhost
- **Port**: 5433 (to avoid conflicts, following Blockbase pattern)
- **Database**: todo_app
- **Username**: blockbase
- **Password**: blockbase_secure_2025
- **Connection String**: `postgresql://blockbase:blockbase_secure_2025@localhost:5433/todo_app`

## Database Schema

### Schema: `todo_app`

### Table: `todos`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Auto-generated UUID |
| title | VARCHAR(500) | NOT NULL | Todo title (1-500 chars) |
| description | TEXT | NULL | Optional longer description |
| completed | BOOLEAN | NOT NULL, DEFAULT false | Completion status |
| priority | VARCHAR(20) | NOT NULL, DEFAULT 'medium' | Priority: low, medium, high |
| due_date | TIMESTAMP | NULL | Optional due date |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

### Indexes

- `idx_todos_completed` - Speeds up filtering by completion status
- `idx_todos_priority` - Speeds up filtering by priority
- `idx_todos_due_date` - Speeds up sorting/filtering by due date
- `idx_todos_created_at` - Speeds up sorting by creation date

### Triggers

- `update_todos_updated_at` - Automatically updates `updated_at` on row modification

## Migrations

Migration files are in `migrations/` directory and run automatically on first database start.

- `001_create_todos_schema.sql` - Creates schema, table, indexes, and triggers

## Seed Data

Seed files are in `seeds/` directory and run automatically after migrations.

- `001_seed_todos.sql` - Inserts 10 example todos for development

Seed data includes:
- 3 completed todos
- 7 active todos
- Mix of priorities (high, medium, low)
- Some with due dates, some without

## Manual Database Operations

### Connect to Database

```bash
# Using psql
PGPASSWORD=blockbase_secure_2025 psql -h localhost -p 5433 -U blockbase -d todo_app

# Using Docker exec
docker exec -it todo-app-postgres psql -U blockbase -d todo_app
```

### Run Migrations Manually

```bash
# Connect to database
docker exec -i todo-app-postgres psql -U blockbase -d todo_app < backend/database/migrations/001_create_todos_schema.sql
```

### Run Seeds Manually

```bash
# Connect to database
docker exec -i todo-app-postgres psql -U blockbase -d todo_app < backend/database/seeds/001_seed_todos.sql
```

### Useful Queries

```sql
-- View all todos
SELECT * FROM todo_app.todos ORDER BY created_at DESC;

-- Count by status
SELECT completed, COUNT(*) as count
FROM todo_app.todos
GROUP BY completed;

-- Count by priority
SELECT priority, COUNT(*) as count
FROM todo_app.todos
GROUP BY priority
ORDER BY priority;

-- Find overdue todos
SELECT title, due_date
FROM todo_app.todos
WHERE due_date < NOW()
  AND completed = false;
```

## Troubleshooting

### Port Already in Use

If port 5433 is already in use:
```bash
# Find what's using the port
lsof -i :5433

# Either stop that service or change the port in docker-compose.yml
```

### Database Not Starting

```bash
# Check logs
docker logs todo-app-postgres

# Remove and recreate
docker-compose down -v
docker-compose up -d postgres
```

### Permission Errors

Ensure the `blockbase` user has proper permissions:
```sql
GRANT USAGE ON SCHEMA todo_app TO blockbase;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA todo_app TO blockbase;
```

## Production Considerations

For production deployment:
1. Change database password (use secrets management)
2. Enable SSL/TLS connections
3. Set up automated backups
4. Configure connection pooling
5. Tune PostgreSQL performance settings
6. Set up replication for high availability
7. Implement proper access control
