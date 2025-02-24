const validateConfig = require('./validate');
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
        logging: console.log,
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
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    production: {
        ...baseConfig,
        username: config.db.user,
        password: config.db.password,
        database: config.db.name,
        host: config.db.host,
        dialect: 'mysql',
        logging: false,
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

module.exports = new Sequelize(
    envConfig.database,
    envConfig.username,
    envConfig.password,
    envConfig
);