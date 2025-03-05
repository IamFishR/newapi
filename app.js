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
const cors = require('cors'); // Import the cors package
const MonitoringService = require('./services/monitoring/MonitoringService');
const LoggingService = require('./services/monitoring/LoggingService');
const exphbs = require('express-handlebars');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const monitoringRouter = require('./routes/monitoring');
const companiesRouter = require('./routes/companies');
const marketDataRouter = require('./routes/market-data');
const financialDataRouter = require('./routes/financial-data');
const financeRouter = require('./routes/finance');
const debtRouter = require('./routes/debt');
const goalsRouter = require('./routes/goals');
const investmentRouter = require('./routes/investments');
const networthRouter = require('./routes/networth');
const taxRouter = require('./routes/tax');
const shopRouter = require('./routes/shop');
const tasksRouter = require('./routes/tasks');  // Add tasks router
const { max } = require('./models/shop/OrderStatusHistory');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from environment-defined origins and localhost during development
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3002'
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Content-Disposition'],
  credentials: true,
  optionsSuccessStatus: 204, // Changed to 204 for OPTIONS requests
  maxAge: 3600,
  preflightContinue: false
};

// Apply CORS before any other middleware
app.use(cors(corsOptions));

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
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/market-data', marketDataRouter);
app.use('/api/financial-data', financialDataRouter);
app.use('/api/monitoring', monitoringRouter);
app.use('/api/shop', shopRouter);
app.use('/api/tasks', tasksRouter);

// Finance routes
app.use('/api/finance', financeRouter);
app.use('/api/finance', debtRouter);
app.use('/api/finance', goalsRouter);
app.use('/api/finance', investmentRouter);
app.use('/api/finance', networthRouter);
app.use('/api/finance', taxRouter);

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
