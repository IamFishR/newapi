/**
 * Wraps async route handlers to automatically catch errors and pass them to Express's next() function
 * This eliminates the need for try/catch blocks in every route handler
 *
 * @param {Function} fn - The async route handler function to wrap
 * @returns {Function} - Wrapped function that catches errors and passes them to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };