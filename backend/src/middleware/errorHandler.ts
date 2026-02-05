import { Request, Response, NextFunction } from "express";

// Define a custom interface for the error object to handle optional properties
// found in Mongoose, JWT, or custom application errors.
interface CustomError extends Error {
  statusCode?: number;
  type?: string;
  code?: number; // Mongoose duplicate key error code
  errors?: Record<string, { message: string }>; // Mongoose validation errors
  originalError?: any; // For external API errors
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Create a shallow copy. Note: Standard Error properties (message, stack) 
  // are not enumerable and won't copy via spread syntax, so we copy message manually.
  let error: CustomError = { ...err };
  error.message = err.message;

  console.error("Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { ...error, message, statusCode: 404, type: "error" };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { ...error, message, statusCode: 400, type: "error" };
  }

  // Mongoose validation error
  if (err.name === "ValidationError" && err.errors) {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { ...error, message, statusCode: 400, type: "error" };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid Session, Login Again";
    error = { ...error, message, statusCode: 401, type: "error" };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Session Expired, Login Again";
    error = { ...error, message, statusCode: 401, type: "error" };
  }

  if (err.originalError) {
    console.error("External API Error details", err.originalError);
  }

  res.status(error.statusCode || 500).send({
    message: error.message || "Server Error",
    type: error.type || "error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      ...(err.originalError && { apiError: err.originalError.message }),
    }),
  });
};

export default errorHandler;