const fs = require('fs');
const path = require('path');

class DbLoggingService {
    constructor() {
        this.enabled = process.env.DB_LOG_ENABLED === 'true';
        this.logFile = process.env.DB_LOG_FILE || 'logs/db.log';
        
        // Ensure log directory exists
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }

    logQuery(query, queryTime) {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] Query (${queryTime}ms): ${query}\n`;

        fs.appendFile(this.logFile, logEntry, (err) => {
            if (err) {
                console.error('Error writing to database log file:', err);
            }
        });
    }

    createQueryLogger() {
        return (query, queryTime) => {
            this.logQuery(query, queryTime);
        };
    }
}

module.exports = new DbLoggingService();