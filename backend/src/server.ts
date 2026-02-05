import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import dotenv from 'dotenv';
import connectDB from './database/connectDB';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Server port
const PORT: number = parseInt(process.env.PORT || '8080', 10);

// CORS configuration
app.use(
  cors({
    origin: ['https://josh-net.vercel.app/', 'http://localhost:3000'],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'JOSH Net API is running',
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Internal server error',
    type: 'error',
    data: null,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: 'Route not found',
    type: 'error',
    data: null,
  });
});

// Start server
app.listen(PORT, () => console.log('Server running on PORT:', PORT));

export default app;