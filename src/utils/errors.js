class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true, details = {}) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class RateLimitError extends AppError {
  constructor(message, details = {}) {
    super(message, 429, true, details);
  }
}

class AuthenticationError extends AppError {
  constructor(message, details = {}) {
    super(message, 401, true, details);
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, true, details);
  }
}

module.exports = {
  AppError,
  RateLimitError,
  AuthenticationError,
  ValidationError
};
