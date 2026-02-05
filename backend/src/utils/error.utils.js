/**
 * @todo Create a robust External API Error class to handle Claude API errors, etc.
 */

class AppError extends Error {
  constructor(message, statusCode, type = "error") {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.type = type;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = "Invalid Input", statusCode = 400) {
    super(message, statusCode, "error");
  }
}

class AuthorizationError extends AppError {
  constructor(message = "Unauthorized Access", statusCode = 401) {
    super(message, statusCode, "error");
  }
}

class AuthenticationError extends AppError {
  constructor(message = "Authentication Failed", statusCode = 403) {
    super(message, statusCode, "error");
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource Not Found", statusCode = 404) {
    super(message, statusCode, "error");
  }
}

class ExternalApiError extends AppError {
  constructor(message = "External API Error", statusCode = 502) {
    super(message, statusCode, "error");
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthorizationError,
  AuthenticationError,
  NotFoundError,
  ExternalApiError
};
