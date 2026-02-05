/**
 * Base Error class for application-specific errors.
 * Includes status codes and operational flags.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly type: string;

  constructor(message: string, statusCode: number, type: string = "error") {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.type = type;

    // Captures the stack trace to show where the error originated
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Invalid Input", statusCode: number = 400) {
    super(message, statusCode, "error");
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = "Unauthorized Access", statusCode: number = 401) {
    super(message, statusCode, "error");
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = "Authentication Failed", statusCode: number = 403) {
    super(message, statusCode, "error");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource Not Found", statusCode: number = 404) {
    super(message, statusCode, "error");
  }
}

/**
 * Handles errors from third-party services (Claude, AWS, etc.).
 * Accepts an optional 'originalError' to preserve the raw failure details.
 */
export class ExternalApiError extends AppError {
  public readonly originalError?: any;

  constructor(
    message: string = "External API Error", 
    statusCode: number = 502,
    originalError?: any
  ) {
    super(message, statusCode, "error");
    this.originalError = originalError;
  }
}