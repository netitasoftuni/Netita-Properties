class AppError extends Error {
  constructor(message, { status = 400, code = 'BAD_REQUEST' } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
  }
}

class ValidationError extends AppError {
  constructor(message, options = {}) {
    super(message, { status: 400, code: 'INVALID_INPUT', ...options });
  }
}

class ExtractionError extends AppError {
  constructor(message, options = {}) {
    super(message, { status: 422, code: 'EXTRACTION_FAILED', ...options });
  }
}

class UpstreamError extends AppError {
  constructor(message, options = {}) {
    super(message, { status: 502, code: 'UPSTREAM_FAILED', ...options });
  }
}

module.exports = {
  AppError,
  ValidationError,
  ExtractionError,
  UpstreamError
};
