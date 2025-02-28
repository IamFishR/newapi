/**
 * Request validation middleware using JSON schema validation
 */
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { AppError } = require('./error');

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

/**
 * Middleware that validates request body, query or params against a JSON schema
 * 
 * @param {Object} schema - Object with body, query, or params keys containing JSON schemas
 * @returns {Function} Express middleware
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate request body if schema.body is provided
    if (schema.body && req.body) {
      const validate = ajv.compile(schema.body);
      const valid = validate(req.body);
      if (!valid) {
        errors.push(...formatErrors(validate.errors, 'body'));
      }
    }

    // Validate request query if schema.query is provided
    if (schema.query && req.query) {
      const validate = ajv.compile(schema.query);
      const valid = validate(req.query);
      if (!valid) {
        errors.push(...formatErrors(validate.errors, 'query'));
      }
    }

    // Validate request params if schema.params is provided
    if (schema.params && req.params) {
      const validate = ajv.compile(schema.params);
      const valid = validate(req.params);
      if (!valid) {
        errors.push(...formatErrors(validate.errors, 'params'));
      }
    }

    // If there are validation errors, return 400 with the errors
    if (errors.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors
      });
    }

    next();
  };
};

/**
 * Format AJV errors into a more user-friendly format
 * 
 * @param {Array} errors - AJV error objects
 * @param {String} location - Where the error occurred (body, query, params)
 * @returns {Array} Formatted errors
 */
function formatErrors(errors, location) {
  return errors.map(error => {
    // Format the path for easier reading
    const path = error.instancePath
      ? `${location}${error.instancePath}`
      : location;
    
    let message = error.message;
    
    // Add more context to the message based on the error keyword
    if (error.keyword === 'required') {
      message = `Missing required property: ${error.params.missingProperty}`;
    } else if (error.keyword === 'enum') {
      message = `Should be one of: ${error.params.allowedValues.join(', ')}`;
    }
    
    return {
      path,
      message
    };
  });
}

module.exports = { validateRequest };