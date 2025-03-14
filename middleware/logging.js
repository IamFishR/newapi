const LoggingService = require('../services/monitoring/LoggingService');

const loggingMiddleware = (req, res, next) => {
    // Record start time
    req._startTime = Date.now();

    // Store original end function
    const originalEnd = res.end;

    // Override end function
    res.end = function (chunk, encoding) {
        // Calculate response time
        const responseTime = Date.now() - req._startTime;

        // Call original end function
        originalEnd.call(this, chunk, encoding);

        // Only log if there was an error (status >= 400)
        if (res.statusCode >= 400) {
            LoggingService.logRequest(req, res, responseTime);
        }
    };

    next();
};

module.exports = loggingMiddleware;