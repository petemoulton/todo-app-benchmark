# Todo App Database Configuration

## Overview
This document describes the database setup for the todo-app-benchmark project, following Blockbase architectural patterns.

## Connection Details
- **Host**: localhost
- **Port**: 5433 (dedicated port following Blockbase pattern to avoid conflicts)
- **Database**: todo_app
- **Username**: blockbase
- **Password**: blockbase_secure_2025
- **Container**: todo-app-postgres
- **Image**: postgis/postgis:15-3.4

## Connection String
```
postgresql://blockbase:blockbase_secure_2025@localhost:5433/todo_app
```

## Quick Start

### 1. Start Database
```bash
docker-compose up -d postgres
```

This command will:
- Pull the PostGIS 15-3.4 image if not already available
- Create and start the PostgreSQL container on port 5433
- Automatically run schema migrations (`001-schema.sql`)
- Automatically seed database with 10 example todos (`002-seed-data.sql`)
- Configure health checks for monitoring

### 2. Verify Database is Running
```bash
docker-compose ps
```

Expected output:
```
NAME                  IMAGE                    STATUS              PORTS
todo-app-postgres     postgis/postgis:15-3.4   Up (healthy)        0.0.0.0:5433->5432/tcp
```

### 3. Connect to Database
```bash
# Using psql
PGPASSWORD=blockbase_secure_2025 psql -h localhost -p 5433 -U blockbase -d todo_app

# Using connection string
psql postgresql://blockbase:blockbase_secure_2025@localhost:5433/todo_app
```

## Database Schema

### Schema: `todo_app`
The application uses a dedicated schema to organize tables and avoid conflicts with system tables.

### Table: `todo_app.todos`

| Column        | Type          | Nullable | Default              | Description                                    |
|---------------|---------------|----------|----------------------|------------------------------------------------|
| id            | UUID          | No       | uuid_generate_v4()   | Unique identifier (primary key)                |
| title         | VARCHAR(500)  | No       | -                    | Todo title (1-500 characters)                  |
| description   | TEXT          | Yes      | NULL                 | Optional description (max 5000 characters)     |
| completed     | BOOLEAN       | No       | false                | Completion status                              |
| priority      | VARCHAR(20)   | No       | 'medium'             | Priority: 'low', 'medium', or 'high'           |
| due_date      | TIMESTAMP     | Yes      | NULL                 | Optional due date/time                         |
| created_at    | TIMESTAMP     | No       | CURRENT_TIMESTAMP    | Record creation timestamp                      |
| updated_at    | TIMESTAMP     | No       | CURRENT_TIMESTAMP    | Last update timestamp (auto-updated)           |

### Indexes
Performance-optimized indexes for common query patterns:

1. `idx_todos_completed` - B-tree index on `completed` for filtering by status
2. `idx_todos_priority` - B-tree index on `priority` for filtering by priority
3. `idx_todos_due_date` - Partial B-tree index on `due_date` (only non-NULL values)
4. `idx_todos_created_at` - B-tree index on `created_at` (DESC) for sorting
5. `idx_todos_search` - GIN index on full-text search vector for title/description

### Constraints
- `PRIMARY KEY` on `id`
- `CHECK` constraint: `priority` must be 'low', 'medium', or 'high'
- `CHECK` constraint: `title` must not be empty (trimmed)
- `CHECK` constraint: `description` max length 5000 characters

### Triggers
- `update_todos_updated_at` - Automatically updates `updated_at` timestamp on any UPDATE

## Seed Data

The database is automatically seeded with 10 example todos on first initialization:

- **4 completed todos** (various priorities, all with due dates in the past)
- **6 incomplete todos** (various priorities, mix of with/without due dates)
- **Priority distribution**: 2 high, 4 medium, 4 low
- **Due dates**: 7 todos with due dates, 3 without

This seed data provides realistic examples for testing and development.

## Docker Commands

### Start Database
```bash
docker-compose up -d postgres
```

### Stop Database
```bash
docker-compose stop postgres
```

### Restart Database
```bash
docker-compose restart postgres
```

### View Logs
```bash
docker logs -f todo-app-postgres
```

### Check Health Status
```bash
docker inspect todo-app-postgres | grep -A 10 Health
```

### Completely Reset Database
```bash
# WARNING: This will DELETE ALL DATA and recreate with fresh seed data
docker-compose down -v
docker-compose up -d postgres
```

## Database Management

### Backup Database
```bash
# Backup to file
docker exec todo-app-postgres pg_dump -U blockbase -d todo_app > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific schema only
docker exec todo-app-postgres pg_dump -U blockbase -d todo_app -n todo_app > backup_todo_app_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
# Restore from backup
docker exec -i todo-app-postgres psql -U blockbase -d todo_app < backup_20251021_120000.sql
```

### Run Custom SQL
```bash
# Execute SQL file
docker exec -i todo-app-postgres psql -U blockbase -d todo_app < custom_query.sql

# Execute inline SQL
docker exec todo-app-postgres psql -U blockbase -d todo_app -c "SELECT COUNT(*) FROM todo_app.todos;"
```

### Access PostgreSQL Shell
```bash
docker exec -it todo-app-postgres psql -U blockbase -d todo_app
```

Useful commands in psql:
```sql
-- List all schemas
\dn

-- List all tables in todo_app schema
\dt todo_app.*

-- Describe todos table
\d todo_app.todos

-- Show table with indexes
\d+ todo_app.todos

-- List all indexes
\di todo_app.*

-- Exit psql
\q
```

## Performance Monitoring

### Query Statistics
```sql
-- Enable query statistics (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- View slow queries
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%todo_app.todos%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Table Statistics
```sql
-- Table size
SELECT
    pg_size_pretty(pg_total_relation_size('todo_app.todos')) as total_size,
    pg_size_pretty(pg_relation_size('todo_app.todos')) as table_size,
    pg_size_pretty(pg_total_relation_size('todo_app.todos') - pg_relation_size('todo_app.todos')) as indexes_size;

-- Row count and statistics
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count,
    n_dead_tup as dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE tablename = 'todos';
```

### Index Usage
```sql
-- Check if indexes are being used
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'todo_app'
ORDER BY idx_scan DESC;
```

## Troubleshooting

### Database Won't Start
1. Check if port 5433 is already in use:
   ```bash
   lsof -i :5433
   ```

2. Check Docker logs:
   ```bash
   docker logs todo-app-postgres
   ```

3. Verify Docker daemon is running:
   ```bash
   docker ps
   ```

### Connection Issues
1. Verify container is healthy:
   ```bash
   docker-compose ps
   ```

2. Test connection from host:
   ```bash
   pg_isready -h localhost -p 5433 -U blockbase -d todo_app
   ```

3. Check network configuration:
   ```bash
   docker network ls
   docker network inspect todo-app-network
   ```

### Schema Not Found
If you get "schema todo_app does not exist" errors:

1. Check if init scripts ran:
   ```bash
   docker logs todo-app-postgres | grep "database system is ready"
   ```

2. Manually run migrations:
   ```bash
   docker exec -i todo-app-postgres psql -U blockbase -d todo_app < backend/database/init/001-schema.sql
   docker exec -i todo-app-postgres psql -U blockbase -d todo_app < backend/database/init/002-seed-data.sql
   ```

### Performance Issues
1. Run VACUUM ANALYZE:
   ```sql
   VACUUM ANALYZE todo_app.todos;
   ```

2. Check for missing indexes:
   ```sql
   SELECT schemaname, tablename, attname, n_distinct, correlation
   FROM pg_stats
   WHERE schemaname = 'todo_app' AND tablename = 'todos';
   ```

3. Use EXPLAIN ANALYZE for slow queries:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM todo_app.todos WHERE completed = false ORDER BY created_at DESC;
   ```

## Port Registry
This database is registered on port **5433** in the development port registry to avoid conflicts with:
- Default PostgreSQL (5432)
- Blockbase main database (5433 shared pattern)
- Other local PostgreSQL instances

## Architecture Notes

### Why PostGIS?
Following Blockbase pattern, we use PostGIS image even though this app doesn't need geospatial features. Benefits:
- Consistent with Blockbase infrastructure
- Future-proof for potential location-based features
- Includes useful extensions (pg_trgm for full-text search)
- Same PostgreSQL 15 version as Blockbase

### Why UUID Instead of SERIAL?
- UUIDs prevent enumeration attacks
- Distributed-system ready (no coordination needed)
- Can generate IDs client-side if needed
- Industry best practice for modern applications
- Consistent with Blockbase architectural pattern

### Why Dedicated Schema?
- Namespace isolation from system tables
- Easier backup/restore of application data only
- Better permission management
- Follows PostgreSQL best practices
- Consistent with Blockbase multi-schema approach

### Automatic Timestamps
The `updated_at` trigger automatically maintains timestamp accuracy:
- No application-level logic needed
- Database-level guarantee of consistency
- Follows Blockbase pattern for audit trails

## Security Considerations

### Development Mode
Current configuration is optimized for local development:
- Simple password (change in production)
- Permissive grants (restrict in production)
- Health checks exposed (monitor in production)
- No SSL required (enable in production)

### Production Checklist
Before deploying to production:
- [ ] Change default password
- [ ] Restrict database permissions (remove PUBLIC grants)
- [ ] Enable SSL/TLS connections
- [ ] Configure connection pooling (PgBouncer)
- [ ] Set up automated backups
- [ ] Configure monitoring and alerting
- [ ] Enable audit logging
- [ ] Implement connection limits
- [ ] Use environment variables for credentials
- [ ] Set up database firewall rules

## References
- PostgreSQL Documentation: https://www.postgresql.org/docs/15/
- PostGIS Documentation: https://postgis.net/documentation/
- Blockbase Architecture: `/Users/petermoulton/Repos/blockbase`
- Port Registry: `/Users/petermoulton/Repos/dev-tools/port-registry/`
