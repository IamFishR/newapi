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

// Import new models
const CompanyIndex = require('./stock/CompanyIndex');
const CorporateAction = require('./stock/CorporateAction');
const BoardMeeting = require('./stock/BoardMeeting');
const SecurityInfo = require('./stock/SecurityInfo');
const RiskMetric = require('./stock/RiskMetric');
const DeliveryPosition = require('./stock/DeliveryPosition');
const ShareholdingPattern = require('./stock/ShareholdingPattern');
const Announcement = require('./stock/Announcement');
const PriceLimit = require('./market/PriceLimit');
const HistoricalPrice = require('./market/HistoricalPrice');
const HistoricalExtreme = require('./market/HistoricalExtreme');
const BidAsk = require('./market/BidAsk');
const Notification = require('./user/Notification');
const ApiKey = require('./user/ApiKey');
const UserRole = require('./user/UserRole');
const RolePermission = require('./user/RolePermission');
const UserPermission = require('./user/UserPermission');

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
    AuditLog: AuditLog(sequelize, DataTypes),
    
    // Initialize new models
    CompanyIndex: CompanyIndex(sequelize, DataTypes),
    CorporateAction: CorporateAction(sequelize, DataTypes),
    BoardMeeting: BoardMeeting(sequelize, DataTypes),
    SecurityInfo: SecurityInfo(sequelize, DataTypes),
    RiskMetric: RiskMetric(sequelize, DataTypes),
    DeliveryPosition: DeliveryPosition(sequelize, DataTypes),
    ShareholdingPattern: ShareholdingPattern(sequelize, DataTypes),
    Announcement: Announcement(sequelize, DataTypes),
    PriceLimit: PriceLimit(sequelize, DataTypes),
    HistoricalPrice: HistoricalPrice(sequelize, DataTypes),
    HistoricalExtreme: HistoricalExtreme(sequelize, DataTypes),
    BidAsk: BidAsk(sequelize, DataTypes),
    Notification: Notification(sequelize, DataTypes),
    ApiKey: ApiKey(sequelize, DataTypes),
    UserRole: UserRole(sequelize, DataTypes),
    RolePermission: RolePermission(sequelize, DataTypes),
    UserPermission: UserPermission(sequelize, DataTypes)
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