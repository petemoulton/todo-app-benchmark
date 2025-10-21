# Todo App Backend API

Express.js REST API for the Todo App Benchmark project.

## Features

- ✅ 9 REST API endpoints for CRUD operations
- ✅ Zod request validation
- ✅ PostgreSQL database integration
- ✅ Error handling middleware
- ✅ CORS configuration
- ✅ Health check and statistics endpoints
- ✅ >80% test coverage

## Prerequisites

- Node.js 20+
- PostgreSQL database running on port 5433
- Database schema created (see `backend/database/`)

## Installation

```bash
cd backend/api
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin

## Development

Start the development server with auto-reload:

```bash
npm run dev
```

## Testing

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Watch mode for development:

```bash
npm run test:watch
```

## API Endpoints

### Todos

- `GET /api/todos` - List all todos
  - Query params: `completed`, `priority`, `search`, `page`, `limit`
- `POST /api/todos` - Create a new todo
- `GET /api/todos/:id` - Get a single todo
- `PATCH /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo
- `POST /api/todos/:id/toggle` - Toggle completion status
- `DELETE /api/todos` - Clear all completed todos

### Health & Stats

- `GET /api/health` - Health check endpoint
- `GET /api/stats` - Get todo statistics

## Request/Response Examples

### Create Todo

```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "due_date": "2025-12-31T23:59:59.000Z"
}
```

Response (201):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high",
  "due_date": "2025-12-31T23:59:59.000Z",
  "completed": false,
  "created_at": "2025-10-21T12:00:00.000Z",
  "updated_at": "2025-10-21T12:00:00.000Z"
}
```

### List Todos with Filters

```bash
GET /api/todos?completed=false&priority=high&search=groceries
```

Response (200):
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Buy groceries",
      "completed": false,
      "priority": "high",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  }
}
```

### Get Statistics

```bash
GET /api/stats
```

Response (200):
```json
{
  "total": 10,
  "completed": 5,
  "incomplete": 5,
  "completionRate": 50,
  "byPriority": {
    "high": 3,
    "medium": 4,
    "low": 3
  },
  "overdue": 2
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "details": {} // Optional additional details
}
```

Common status codes:
- `400` - Bad Request (validation failed)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `500` - Internal Server Error

## Project Structure

```
backend/api/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── todos.ts     # Todo CRUD endpoints
│   │   └── health.ts    # Health & stats endpoints
│   ├── middleware/      # Express middleware
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── schemas/         # Zod validation schemas
│   │   └── todo.schema.ts
│   ├── utils/           # Utilities
│   │   └── db.ts        # Database client
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── tests/               # Test files
│   ├── setup.ts         # Test utilities
│   ├── todos.test.ts    # Todo route tests
│   ├── health.test.ts   # Health route tests
│   ├── schemas.test.ts  # Schema tests
│   └── middleware.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## Architecture

This API follows the Blockbase pattern:

1. **Database First**: Direct PostgreSQL queries with parameterized statements
2. **Validation**: Zod schemas for type-safe request validation
3. **Error Handling**: Centralized error middleware
4. **Testing**: Integration tests with real database
5. **TypeScript**: Strict mode enabled for type safety

## Performance

- All database queries use indexes
- Pagination for large result sets
- Connection pooling enabled
- No N+1 query issues

## Security

- Parameterized SQL queries prevent SQL injection
- Zod validation prevents invalid data
- CORS restricted to configured origins
- No secrets in source code
- Input length limits enforced

## Contributing

This is a benchmark project. See the main README for contribution guidelines.

## License

MIT
