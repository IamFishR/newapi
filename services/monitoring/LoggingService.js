const fs = require('fs');
const path = require('path');
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

class LoggingService {
    constructor() {
        const logsDir = path.join(__dirname, '../../logs');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }

        // Define log formats
        const logFormat = winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        );

        // Create loggers for different types of logs
        this.requestLogger = winston.createLogger({
            format: logFormat,
            transports: [
                new DailyRotateFile({
                    filename: path.join(logsDir, 'requests-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d'
                })
            ]
        });

        this.errorLogger = winston.createLogger({
            format: logFormat,
            transports: [
                new DailyRotateFile({
                    filename: path.join(logsDir, 'errors-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '14d'
                })
            ]
        });

        this.debugLogger = winston.createLogger({
            format: logFormat,
            transports: [
                new DailyRotateFile({
                    filename: path.join(logsDir, 'debug-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    maxSize: '20m',
                    maxFiles: '7d'
                })
            ]
        });

        // Add console transport in development
        if (process.env.NODE_ENV !== 'production') {
            const consoleTransport = new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            });
            this.requestLogger.add(consoleTransport);
            this.errorLogger.add(consoleTransport);
            this.debugLogger.add(consoleTransport);
        }
    }

    logRequest(req, res, responseTime) {
        const logData = {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            responseTime: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.id,
            query: req.query,
            body: this._sanitizeBody(req.body)
        };

        this.requestLogger.info('API Request', logData);
    }

    logError(error, req = null) {
        const logData = {
            message: error.message,
            stack: error.stack,
            code: error.code,
            timestamp: new Date().toISOString()
        };

        if (req) {
            logData.method = req.method;
            logData.url = req.url;
            logData.userId = req.user?.id;
            logData.ip = req.ip;
        }

        this.errorLogger.error('Error occurred', logData);
    }

    logDebug(message, data = {}) {
        this.debugLogger.debug(message, data);
    }

    _sanitizeBody(body) {
        if (!body) return body;
        const sanitized = { ...body };
        
        // Remove sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '[REDACTED]';
            }
        });
        
        return sanitized;
    }
}

module.exports = new LoggingService();