const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.MYSQL_DB,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: false
        },
    }
);

module.exports = sequelize;