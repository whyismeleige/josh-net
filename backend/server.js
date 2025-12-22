/**
 * Server Entry Point
 * 
 * Main application file that initializes and configures the Express server.
 * Sets up middleware, database connection, routes, Socket.IO, and error handling.
 * 
 * This is the entry point for the JOSH Net API application.
 */

const express = require("express");
const cors = require("cors");
const intializeSocket = require("./sockets");
const { createServer } = require("node:http");
const connectDB = require("./database/connectDB");
require("dotenv").config(); // Load environment variables from .env file

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

/**
 * Create Express application instance
 */
const app = express();

/**
 * Create HTTP server wrapped around Express app
 * Required for Socket.IO integration
 */
const server = createServer(app);

/**
 * Initialize Socket.IO for real-time communication
 * Returns configured Socket.IO instance
 */
const io = intializeSocket(server);

/**
 * Server port from environment variable or default to 8080
 */
const PORT = process.env.PORT || 8080;

// ============================================================================
// ROUTE IMPORTS
// ============================================================================

/**
 * Authentication routes
 * Handles user registration, login, logout, password reset, etc.
 */
const authRoutes = require("./routes/auth.routes");

/**
 * Student-specific routes
 * Handles student profile, courses, grades, etc.
 */
const studentRoutes = require("./routes/student.routes");

/**
 * Server/admin routes
 * Handles administrative functions and server management
 */
const serverRoutes = require("./routes/server.routes");

/**
 * Josephine AI chatbot routes
 * Handles AI chat conversations, message history, file uploads
 */
const josephineRoutes = require("./routes/josephine.routes");

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

/**
 * Make Socket.IO instance available throughout the application
 * This allows controllers and other modules to emit real-time events
 * 
 * Usage in controllers: const io = req.app.get('io');
 */
app.set("io", io);

// ============================================================================
// MIDDLEWARE SETUP
// ============================================================================

/**
 * CORS (Cross-Origin Resource Sharing) middleware
 * Allows the API to accept requests from specified frontend origins
 * 
 * Configuration:
 * - origin: Array of allowed origins (production and development)
 * - credentials: Enable sending cookies and authentication headers
 */
app.use(
  cors({
    origin: ["https://josh-net.vercel.app/", "http://localhost:3000"],
    credentials: true,
  })
);

/**
 * Body parsing middleware
 * 
 * express.json() - Parses incoming JSON payloads
 * express.urlencoded() - Parses URL-encoded form data
 * extended: true - Allows parsing of nested objects
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

/**
 * Establish connection to MongoDB database
 * Uses configuration from environment variables
 */
connectDB();

// ============================================================================
// ROUTE REGISTRATION
// ============================================================================

/**
 * Register route handlers with their base paths
 * 
 * API Structure:
 * /api/v1/auth/*       - Authentication and authorization
 * /api/v1/student/*    - Student-specific functionality
 * /api/v1/server/*     - Server/admin functionality
 * /api/v1/josephine/*  - AI chatbot functionality
 */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/student", studentRoutes);
app.use("/api/v1/server", serverRoutes);
app.use("/api/v1/josephine", josephineRoutes);

// ============================================================================
// UTILITY ROUTES
// ============================================================================

/**
 * Health check endpoint
 * 
 * Used by monitoring services and load balancers to verify
 * the API is running and responsive
 * 
 * @route   GET /health
 * @access  Public
 * @returns {Object} Status information and timestamp
 */
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "JOSH Net API is running",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

/**
 * Global error handler
 * 
 * Catches any errors that occur in route handlers or middleware
 * Provides consistent error response format
 * 
 * Note: This must be defined AFTER all routes to catch their errors
 * 
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Next middleware function
 */
app.use((err, req, res, next) => {
  // Log error details to console for debugging
  console.error(err.stack);

  // Send standardized error response
  res.status(500).json({
    message: err.message || "Internal server error",
    type: "error",
    data: null,
  });
});

/**
 * 404 Not Found handler
 * 
 * Catches all requests to undefined routes
 * Must be defined last (after all valid routes)
 * 
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    type: "error",
    data: null,
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

/**
 * Start the HTTP server
 * 
 * Listens on the specified PORT for incoming requests
 * Uses the 'server' instance (not 'app') to support Socket.IO
 */
server.listen(PORT, () => console.log("Server running on PORT:", PORT));

/**
 * Export the Express app
 * 
 * Useful for:
 * - Testing (importing app into test files)
 * - Serverless deployments (Vercel, AWS Lambda, etc.)
 */
module.exports = app;