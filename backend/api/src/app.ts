/**
 * Express application setup
 */
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import todosRouter from './routes/todos.js';
import healthRouter from './routes/health.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/todos', todosRouter);
app.use('/api', healthRouter);

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
