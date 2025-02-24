const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const Company = require('./stock/Company');
const User = require('./user/User');
const Portfolio = require('./user/Portfolio');
const Transaction = require('./user/Transaction');
const PriceData = require('./market/PriceData');
const MarketDepth = require('./market/MarketDepth');
const FinancialResult = require('./finance/FinancialResult');
const WatchList = require('./user/WatchList');
const UserPreference = require('./user/UserPreference');
const UserSession = require('./user/UserSession');
const Role = require('./user/Role');
const Permission = require('./user/Permission');
const AuditLog = require('./audit/AuditLog');

// Initialize models
const models = {
    Company: Company(sequelize, DataTypes),
    User: User(sequelize, DataTypes),
    Portfolio: Portfolio(sequelize, DataTypes),
    Transaction: Transaction(sequelize, DataTypes),
    PriceData: PriceData(sequelize, DataTypes),
    MarketDepth: MarketDepth(sequelize, DataTypes),
    FinancialResult: FinancialResult(sequelize, DataTypes),
    WatchList: WatchList(sequelize, DataTypes),
    UserPreference: UserPreference(sequelize, DataTypes),
    UserSession: UserSession(sequelize, DataTypes),
    Role: Role(sequelize, DataTypes),
    Permission: Permission(sequelize, DataTypes),
    AuditLog: AuditLog(sequelize, DataTypes)
};

// Set up associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = {
    sequelize,
    ...models
};