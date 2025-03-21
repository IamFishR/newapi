const { sequelize } = require('../config/sequelize');
const { DataTypes } = require('sequelize');

// Import models
const modelDefinitions = {
    // Core models
    Company: require('./stock/Company'),
    User: require('./user/User'),
    Portfolio: require('./user/Portfolio'),
    Transaction: require('./user/Transaction'),
    PriceData: require('./market/PriceData'),
    MarketDepth: require('./market/MarketDepth'),
    BudgetCategory: require('./finance/BudgetCategory'),
    FinancialResult: require('./finance/FinancialResult'),
    WatchList: require('./user/WatchList'),
    UserPreference: require('./user/UserPreference'),
    UserSession: require('./user/UserSession'),
    Role: require('./user/Role'),
    Permission: require('./user/Permission'),
    AuditLog: require('./audit/AuditLog'),
    Notification: require('./user/Notification'),
    
    // Stock/market models
    CompanyIndex: require('./stock/CompanyIndex'),
    CorporateAction: require('./stock/CorporateAction'),
    BoardMeeting: require('./stock/BoardMeeting'),
    SecurityInfo: require('./stock/SecurityInfo'),
    RiskMetric: require('./stock/RiskMetric'),
    DeliveryPosition: require('./stock/DeliveryPosition'),
    ShareholdingPattern: require('./stock/ShareholdingPattern'),
    Announcement: require('./stock/Announcement'),
    PriceLimit: require('./market/PriceLimit'),
    HistoricalPrice: require('./market/HistoricalPrice'),
    HistoricalExtreme: require('./market/HistoricalExtreme'),
    BidAsk: require('./market/BidAsk'),
    BankAccount: require('./finance/BankAccount'),

    // Task management models
    Project: require('./task/Project'),
    Sprint: require('./task/Sprint'),
    Task: require('./task/Task'),
    TaskType: require('./task/TaskType'),
    TaskPriority: require('./task/TaskPriority'),
    TaskLabel: require('./task/TaskLabel'),
    TaskComment: require('./task/TaskComment'),
    TaskAttachment: require('./task/TaskAttachment'),
    TaskTimeLog: require('./task/TaskTimeLog'),
    TaskStatusHistory: require('./task/TaskStatusHistory'),
    TaskAssignmentHistory: require('./task/TaskAssignmentHistory'),
    TaskMetrics: require('./task/TaskMetrics'),
    TaskAuditLog: require('./task/TaskAuditLog'),

    // Shop models
    Shop: require('./shop/Shop'),
    Product: require('./shop/Product'),
    ShopCategory: require('./shop/ShopCategory'),
    ShopAuditLog: require('./shop/ShopAuditLog'),
    Order: require('./shop/Order'),
    OrderItem: require('./shop/OrderItem'),
    OrderStatusHistory: require('./shop/OrderStatusHistory'),
    ProductTag: require('./shop/ProductTag'),
    ProductPriceHistory: require('./shop/ProductPriceHistory'),
    InventoryMovement: require('./shop/InventoryMovement')
};

// Initialize models
const models = Object.entries(modelDefinitions).reduce((acc, [name, definition]) => {
    acc[name] = definition(sequelize, DataTypes);
    return acc;
}, {});

// Set up model associations
Object.values(models).forEach(model => {
    if (model.associate) {
        model.associate(models);
    }
});

module.exports = {
    sequelize,
    ...models
};