class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // if the status code starts with 4 (404 etc), the status is 'fail', otherwise (500 etc) its an error
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // All the errors will get this property to indicate (when testing) that the errors are operational
    this.isOperational = true;
    // This is how we capture the stack trace without the AppError (constructor) object polluting the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
