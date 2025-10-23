# Product Requirements Document
## Todo Application - Multi-Agent Benchmark (Simplified)

### Document Control
- **Version**: 1.0
- **Created**: 2025-10-21
- **Model Being Tested**: Claude Sonnet 4.5
- **Agent Strategy**: Parallel
- **Execution ID**: Generated on run
- **Type**: Agent Benchmark (No Production Use)

---

## 1. PRODUCT OVERVIEW

### 1.1 Purpose
Build a local-only Todo application following Blockbase architectural patterns to benchmark multi-agent development capabilities. **No authentication required** - simplified for pure development workflow testing.

### 1.2 Success Criteria
- ✅ All acceptance criteria met (see Section 6)
- ✅ >80% test coverage (backend), >70% (frontend)
- ✅ All CI/CD checks passing
- ✅ Full Linear ticket lifecycle (Created → In Progress → QA → Done)
- ✅ Working deployment on allocated port
- ✅ Tagged as `benchmark` in Linear for easy filtering

---

## 2. TECHNICAL ARCHITECTURE

### 2.1 Tech Stack (Blockbase Pattern)

**Monorepo Structure:**
```
todo-app-benchmark/
├── backend/
│   ├── api/           # Express REST API
│   └── database/      # PostgreSQL schemas + migrations
├── frontend/
│   └── todo-app/      # React + TypeScript
└── shared/
    └── types/         # Shared TypeScript types
```

**Backend:**
- Runtime: Node.js 20+
- Framework: Express.js
- API: REST endpoints
- Database: PostgreSQL (port 5433, following Blockbase pattern)
- ORM: Raw SQL or simple query builder (match Blockbase style)
- Validation: Zod
- Testing: Vitest (match Blockbase pattern)

**Frontend:**
- Framework: React 18+
- Language: TypeScript
- Build: Vite
- Styling: Tailwind CSS
- State: React Query + Context
- Forms: React Hook Form
- Testing: Vitest + Testing Library

**Infrastructure:**
- Database: PostgreSQL via Docker (port 5433)
- Port Allocation: Auto-allocated from port registry
- CI/CD: GitHub Actions
- Deployment: Local development server

### 2.2 Database Schema

```sql
-- Simple schema, no auth needed
CREATE SCHEMA IF NOT EXISTS todo_app;

-- Todos table (no user_id, local only)
CREATE TABLE todo_app.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_todos_completed ON todo_app.todos(completed);
CREATE INDEX idx_todos_priority ON todo_app.todos(priority);
CREATE INDEX idx_todos_due_date ON todo_app.todos(due_date);
CREATE INDEX idx_todos_created_at ON todo_app.todos(created_at);
```

### 2.3 API Endpoints

**Todos CRUD:**
- `GET /api/todos` - List all todos (with filters: completed, priority)
- `POST /api/todos` - Create new todo
- `GET /api/todos/:id` - Get single todo
- `PATCH /api/todos/:id` - Update todo (partial updates)
- `DELETE /api/todos/:id` - Delete todo
- `POST /api/todos/:id/toggle` - Toggle completion status
- `DELETE /api/todos` - Clear all completed todos

**Utility:**
- `GET /api/health` - Health check endpoint
- `GET /api/stats` - Statistics (total, completed, by priority)

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Todo Management (No Auth)
- Create todos with: title (required), description (optional), priority, due date
- View all todos (paginated, default 50 per page)
- Filter todos by: completion status, priority
- Search todos by title/description (full-text search)
- Update any todo field
- Delete individual todos
- Delete all completed todos (bulk action)
- Toggle completion status with single action

### 3.2 Data Validation
- Title: 1-500 characters, required
- Description: 0-5000 characters, optional
- Priority: enum ['low', 'medium', 'high'], default 'medium'
- Due date: valid ISO 8601 timestamp, optional
- Completed: boolean, default false

### 3.3 UI Requirements
- Clean, minimal design with Tailwind CSS
- Responsive layout (mobile-first)
- Loading states for all async operations
- Error handling with user-friendly messages
- Optimistic UI updates
- Keyboard shortcuts:
  - Enter: Save
  - Escape: Cancel
  - Ctrl+N: New todo
  - /: Focus search

### 3.4 Default Data
- Seed database with 10 example todos on first run
- Mix of completed/incomplete
- Mix of priorities
- Some with due dates, some without

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance
- API response time: p95 < 200ms
- Page load time: < 2 seconds
- Database queries: All indexed, no N+1 issues
- Frontend bundle size: < 500KB

### 4.2 Security
- No SQL injection vulnerabilities (use parameterized queries)
- No XSS vulnerabilities (sanitize inputs)
- CORS configured for localhost only
- No secrets in source code
- Environment variables for configuration

### 4.3 Code Quality
- TypeScript strict mode enabled
- ESLint passing with no warnings
- Prettier formatting applied
- No console.logs in production code
- Meaningful variable/function names
- JSDoc comments for public APIs

### 4.4 Testing
- Backend: >80% coverage (statements, branches, functions)
- Frontend: >70% coverage
- All critical paths have integration tests
- E2E smoke test for complete flow:
  1. Load app
  2. Create todo
  3. Mark complete
  4. Delete todo

---

## 5. LINEAR TICKET BREAKDOWN

**Project**: MFO
**Labels**: `benchmark`, `agent-test`, `todo-app`
**Priority**: Low (to separate from real work)

### Ticket #1: Database Schema & Setup
**Assignee**: strategic-planner agent
**Estimate**: 30 minutes
**Acceptance Criteria:**
- [ ] SQL schema matches spec in Section 2.2
- [ ] Migration scripts in `backend/database/migrations/`
- [ ] Seed script with 10 example todos
- [ ] Docker Compose configuration for PostgreSQL
- [ ] Database healthcheck passing
- [ ] README with database setup instructions

### Ticket #2: Backend API Implementation
**Assignee**: build-agent (backend)
**Estimate**: 45 minutes
**Acceptance Criteria:**
- [ ] All 9 API endpoints implemented
- [ ] Request validation with Zod schemas
- [ ] Error handling middleware (4xx, 5xx)
- [ ] CORS middleware configured
- [ ] Health check endpoint working
- [ ] Unit tests >80% coverage
- [ ] Integration tests for all endpoints
- [ ] OpenAPI/Swagger documentation

### Ticket #3: Frontend UI Components
**Assignee**: build-agent (frontend)
**Estimate**: 45 minutes
**Acceptance Criteria:**
- [ ] TodoList component with filtering UI
- [ ] TodoItem component with inline edit mode
- [ ] CreateTodo form with validation
- [ ] Search/Filter bar
- [ ] Statistics dashboard (total, completed counts)
- [ ] Loading/Error states for all operations
- [ ] Responsive design (mobile 375px+, desktop 1024px+)
- [ ] Component tests >70% coverage
- [ ] Storybook or component showcase

### Ticket #4: Frontend-Backend Integration
**Assignee**: build-agent (integration)
**Estimate**: 30 minutes
**Acceptance Criteria:**
- [ ] React Query setup for API calls
- [ ] Optimistic updates for create/update/delete
- [ ] Error boundary implemented
- [ ] Toast notifications for actions
- [ ] Loading skeleton screens
- [ ] E2E test: Full CRUD flow
- [ ] API client with TypeScript types from backend

### Ticket #5: QA, Testing & Documentation
**Assignee**: qa-agent + code-reviewer
**Estimate**: 30 minutes
**Acceptance Criteria:**
- [ ] All tests passing (`npm test` in root)
- [ ] Coverage thresholds met (>80% backend, >70% frontend)
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices)
- [ ] ESLint passing (0 errors, 0 warnings)
- [ ] TypeScript strict mode (0 type errors)
- [ ] Security scan passing (npm audit)
- [ ] Code review checklist completed
- [ ] QA test plan executed
- [ ] Final QA report submitted to Linear
- [ ] README complete with setup, usage, architecture

---

## 6. ACCEPTANCE CRITERIA (Final Deliverable)

### ✅ Must Have (P0):
1. ✅ Working app deployed on `http://localhost:[PORT]`
2. ✅ All 9 API endpoints functional
3. ✅ Users can CRUD todos via UI
4. ✅ All tests passing (backend + frontend)
5. ✅ Test coverage >80% backend, >70% frontend
6. ✅ All 5 Linear tickets closed
7. ✅ README with:
   - Setup instructions
   - Architecture overview
   - API documentation
   - Testing instructions
8. ✅ GitHub Actions CI passing
9. ✅ Docker Compose for full stack
10. ✅ No console errors in browser

### 🎯 Nice to Have (P1):
- Todo tags/categories
- Dark mode toggle
- Drag-and-drop reordering
- Due date calendar picker
- Export todos (JSON/CSV)
- Keyboard shortcuts help modal

### ❌ Out of Scope:
- User authentication
- Multi-user support
- Real-time collaboration
- File attachments
- Cloud sync
- Mobile apps
- Notifications/Reminders

---

## 7. TESTING STRATEGY

### 7.1 Unit Tests (Vitest)
**Backend:**
- All database query functions
- All API route handlers
- Input validation schemas
- Error handling utilities

**Frontend:**
- React components (isolated)
- Custom hooks
- Utility functions
- Form validation

### 7.2 Integration Tests
**Backend:**
- Full API endpoint flows
- Database transactions
- Error scenarios (404, 400, 500)

**Frontend:**
- React Query hooks with MSW
- Form submissions
- Optimistic update rollbacks

### 7.3 E2E Tests (Playwright)
- Complete CRUD workflow
- Filter and search functionality
- Responsive design (mobile + desktop viewports)
- Error handling (network failures)

### 7.4 Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e

# Run specific suite
npm test -- backend/api
```

---

## 8. DEPLOYMENT

### 8.1 Port Allocation
- Backend API: Auto-allocated from port registry (3000-4000 range)
- Frontend Dev Server: Auto-allocated +1 from API port
- PostgreSQL: 5433 (Blockbase pattern)

### 8.2 Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://blockbase:blockbase_secure_2025@localhost:5433/todo_app
NODE_ENV=development
PORT=[auto-allocated]
CORS_ORIGIN=http://localhost:[frontend-port]

# Frontend (.env)
VITE_API_URL=http://localhost:[backend-port]
```

### 8.3 Setup Commands
```bash
# Initial setup
git clone [repo]
cd todo-app-benchmark
npm install

# Start database
docker-compose up -d postgres

# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Start backend (terminal 1)
cd backend/api
npm run dev

# Start frontend (terminal 2)
cd frontend/todo-app
npm run dev

# Open app
open http://localhost:[frontend-port]
```

### 8.4 CI/CD Pipeline (GitHub Actions)
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies
      - Lint (ESLint + Prettier)
      - Type check (TypeScript)
      - Unit tests
      - Integration tests
      - E2E tests
      - Coverage report
      - Build
      - Upload artifacts
```

---

## 9. QUANTIFIABLE SUCCESS METRICS

### 9.1 Development Metrics (Auto-Tracked)
| Metric | Target | Measured |
|--------|--------|----------|
| **Total Time** | < 3 hours | TBD |
| **Agent Parallel Time** | < 60 min | TBD |
| **Lines of Code** | 2000-3000 | TBD |
| **Test Coverage (Backend)** | >80% | TBD |
| **Test Coverage (Frontend)** | >70% | TBD |
| **Build Time** | < 5 min | TBD |
| **PR Count** | 5 | TBD |
| **Merge Conflicts** | 0 | TBD |
| **Linear Tickets Completed** | 5 | TBD |

### 9.2 Quality Metrics
| Metric | Target | Measured |
|--------|--------|----------|
| **Test Pass Rate (First Run)** | >90% | TBD |
| **Security Issues** | 0 | TBD |
| **Lint Errors** | 0 | TBD |
| **Type Errors** | 0 | TBD |
| **Lighthouse Performance** | >90 | TBD |
| **Lighthouse Accessibility** | >90 | TBD |
| **Bundle Size (Frontend)** | <500KB | TBD |

### 9.3 Comparison Matrix (Future Runs)
```
| Metric              | Sonnet 4.5 | Haiku | Gemini | Codex |
|---------------------|------------|-------|--------|-------|
| Total Time          | TBD        | -     | -      | -     |
| Test Coverage %     | TBD        | -     | -      | -     |
| First-Run Pass Rate | TBD        | -     | -      | -     |
| Code Quality Score  | TBD        | -     | -      | -     |
| Agent Conflicts     | TBD        | -     | -      | -     |
```

---

## 10. EXECUTION NOTES

### 10.1 Agent Dispatch Strategy
**Parallel Mode (Default):**
- All 5 agents dispatched simultaneously via single message
- Each works in isolated git branch
- PRs created independently
- Merged sequentially after QA approval

**Dependency Order:**
1. Database (strategic-planner) - must complete first
2. Backend + Frontend (parallel after DB done)
3. Integration (after backend + frontend done)
4. QA (after all code complete)

### 10.2 GitHub Integration
- **Repo**: `petemoulton/todo-app-benchmark`
- **Branch naming**: `agent/ticket-{N}-{slug}`
- **PR title**: `[Ticket #{N}] {Title}`
- **PR description**: Auto-include acceptance criteria checklist
- **Labels**: `benchmark`, `agent-generated`

### 10.3 Linear Integration
- **Project**: MFO
- **Labels**: `benchmark`, `agent-test`, `todo-app`
- **Priority**: Low
- **Custom field**: `agent_model` = "sonnet-4.5"
- **Custom field**: `execution_id` = [UUID]
- **Workflow**: Todo → In Progress → QA Review → Done

### 10.4 Knowledge Graph Tracking
All agent decisions captured with tags:
- `#benchmark`
- `#todo-app`
- `#model:sonnet-4.5`
- `#strategy:parallel`
- `#execution-id:[uuid]`
- `#proj:todo-app-benchmark`

### 10.5 Observability Checkpoints
**Tmux Dashboard:**
- Pane 0: Linear ticket status updates
- Pane 1: Code file creation activity
- Pane 4: KG captures appearing
- Pane 5: Service health during load

**Grafana Metrics:**
- PostgreSQL connections (expect 5 concurrent)
- API request rate (once app running)
- Build time metrics

**Linear Board:**
- Tickets moving: Todo → In Progress → Done
- Comments from agents on progress

---

## 11. RISKS & MITIGATIONS

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Agents create merge conflicts | Medium | Medium | Isolated branches, sequential merge |
| Tests fail on first run | Low | Low | Comprehensive PRD, QA agent review |
| Port conflicts | Low | Low | Port registry auto-allocation |
| Database schema divergence | Low | Medium | Strategic planner creates schema first |
| Missing dependencies | Low | Low | Explicit package.json in PRD |

---

## 12. POST-EXECUTION REVIEW

**After completion, capture:**
1. Total execution time
2. Per-agent completion times
3. Number of iterations needed
4. Test coverage achieved
5. Code quality metrics
6. Subjective code review (human)
7. Comparison to hand-written baseline
8. Lessons learned for PRD improvements

**Review Questions:**
- Did agents follow Blockbase patterns correctly?
- Were there any surprising architectural decisions?
- How did parallel agents handle shared resources?
- What would improve for next benchmark run?

---

**END OF PRD**

**Next Steps:**
1. ✅ PRD approved by human
2. Create Linear tickets with this spec
3. Create GitHub repository
4. Execute first agent orchestration run
5. Observe via tmux + Linear + Grafana
6. Generate metrics report
