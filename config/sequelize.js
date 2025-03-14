const validateConfig = require('./validate');
const dbLoggingService = require('../services/monitoring/DbLoggingService');
const config = validateConfig();
const { Sequelize } = require('sequelize');

const baseConfig = {
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        paranoid: true
    }
};

const environments = {
    development: {
        ...baseConfig,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name,
        host: config.db.host,
        dialect: 'mysql',
        logging: dbLoggingService.createQueryLogger(),
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    test: {
        ...baseConfig,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name + '_test',
        host: config.db.host,
        dialect: 'mysql',
        logging: false
    },
    production: {
        ...baseConfig,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name,
        host: config.db.host,
        dialect: 'mysql',
        logging: dbLoggingService.createQueryLogger(),
        pool: {
            max: 10,
            min: 2,
            acquire: 30000,
            idle: 10000
        }
    }
};

const env = process.env.NODE_ENV || 'development';
const envConfig = environments[env];

// Export environments config for Sequelize CLI
module.exports = environments;

// Export Sequelize instance for the application
module.exports.sequelize = new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    {...envConfig}  // Spread the full config including define options
);