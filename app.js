require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { sequelize } = require('./models');
const runSeeders = require('./seeders');
const { errorMiddleware } = require('./middleware/error');
const { sanitizer } = require('./middleware/sanitizer');
const { apiLimiter } = require('./middleware/rateLimiter');
const loggingMiddleware = require('./middleware/logging');
const helmet = require('helmet');
const MonitoringService = require('./services/monitoring/MonitoringService');
const LoggingService = require('./services/monitoring/LoggingService');
const exphbs = require('express-handlebars');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const monitoringRouter = require('./routes/monitoring');
const companiesRouter = require('./routes/companies');
const marketDataRouter = require('./routes/market-data');
const financialDataRouter = require('./routes/financial-data');

const app = express();

// Security middleware
app.use(helmet());

// View engine setup
app.engine('handlebars', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Apply global middleware
app.use(loggingMiddleware);  // Add logging middleware
app.use(sanitizer);  // Sanitize all incoming requests
app.use(apiLimiter); // Apply rate limiting globally

// Initialize database and run seeders if configured
const config = require('./config/validate')();
if (config.db.sync) {
    sequelize.sync().then(async () => {
        try {
            // Only run seeders if explicitly enabled
            if (process.env.RUN_SEEDERS === 'true') {
                await runSeeders();
                LoggingService.logDebug('Database synchronized and seeded successfully');
            } else {
                LoggingService.logDebug('Database synchronized successfully');
            }
        } catch (error) {
            LoggingService.logError(error);
            MonitoringService.trackError('database_init_error', { error: error.message });
        }
    }).catch(error => {
        LoggingService.logError(error);
        MonitoringService.trackError('database_sync_error', { error: error.message });
    });
} else {
    LoggingService.logDebug('Database sync skipped (DB_SYNC=false)');
}

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/monitoring', monitoringRouter);
app.use('/companies', companiesRouter);
app.use('/market-data', marketDataRouter);
app.use('/financial-data', financialDataRouter);

// Error handling middleware
app.use(errorMiddleware);

// Graceful shutdown handler
process.on('SIGTERM', async () => {
    LoggingService.logDebug('SIGTERM signal received: closing HTTP server');
    await MonitoringService.cleanupStaleData();
    MonitoringService.resetMetrics();
    sequelize.close();
});

module.exports = app;
