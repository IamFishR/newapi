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

// Task management models
const Project = require('./task/Project');
const Sprint = require('./task/Sprint');
const Task = require('./task/Task');
const TaskType = require('./task/TaskType');
const TaskPriority = require('./task/TaskPriority');
const TaskLabel = require('./task/TaskLabel');
const TaskComment = require('./task/TaskComment');
const TaskAttachment = require('./task/TaskAttachment');
const TaskTimeLog = require('./task/TaskTimeLog');
const TaskStatusHistory = require('./task/TaskStatusHistory');
const TaskAssignmentHistory = require('./task/TaskAssignmentHistory');
const TaskMetrics = require('./task/TaskMetrics');
const TaskAuditLog = require('./task/TaskAuditLog');

// Shop models
const Shop = require('./shop/Shop');
const Product = require('./shop/Product');
const ShopCategory = require('./shop/ShopCategory');
const ShopAuditLog = require('./shop/ShopAuditLog');
const Order = require('./shop/Order');
const OrderItem = require('./shop/OrderItem');
const ProductTag = require('./shop/ProductTag');
const ProductPriceHistory = require('./shop/ProductPriceHistory');
const InventoryMovement = require('./shop/InventoryMovement');

const models = {
    // Initialize models
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
    
    // Initialize stock/market models
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

    // Initialize task management models
    Project: Project(sequelize, DataTypes),
    Sprint: Sprint(sequelize, DataTypes),
    Task: Task(sequelize, DataTypes),
    TaskType: TaskType(sequelize, DataTypes),
    TaskPriority: TaskPriority(sequelize, DataTypes),
    TaskLabel: TaskLabel(sequelize, DataTypes),
    TaskComment: TaskComment(sequelize, DataTypes),
    TaskAttachment: TaskAttachment(sequelize, DataTypes),
    TaskTimeLog: TaskTimeLog(sequelize, DataTypes),
    TaskStatusHistory: TaskStatusHistory(sequelize, DataTypes),
    TaskAssignmentHistory: TaskAssignmentHistory(sequelize, DataTypes),
    TaskMetrics: TaskMetrics(sequelize, DataTypes),
    TaskAuditLog: TaskAuditLog(sequelize, DataTypes),

    // Initialize shop models
    Shop: Shop(sequelize, DataTypes),
    Product: Product(sequelize, DataTypes),
    ShopCategory: ShopCategory(sequelize, DataTypes),
    ShopAuditLog: ShopAuditLog(sequelize, DataTypes),
    Order: Order(sequelize, DataTypes),
    OrderItem: OrderItem(sequelize, DataTypes),
    ProductTag: ProductTag(sequelize, DataTypes),
    ProductPriceHistory: ProductPriceHistory(sequelize, DataTypes),
    InventoryMovement: InventoryMovement(sequelize, DataTypes)
};

// Set up associations
Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

// Shop Management Associations
ShopCategory.hasMany(Product, {
    foreignKey: 'category_id',
    as: 'products'
});

ShopCategory.hasMany(ShopCategory, {
    foreignKey: 'parent_category_id',
    as: 'subcategories'
});

ShopCategory.belongsTo(ShopCategory, {
    foreignKey: 'parent_category_id',
    as: 'parent'
});

Shop.hasMany(Product, {
    foreignKey: 'shop_id',
    as: 'products'
});

Shop.hasMany(Order, {
    foreignKey: 'shop_id',
    as: 'orders'
});

Product.belongsTo(Shop, {
    foreignKey: 'shop_id'
});

Product.belongsTo(ShopCategory, {
    foreignKey: 'category_id'
});

Product.hasMany(OrderItem, {
    foreignKey: 'product_id'
});

// New associations for the added models
Product.hasMany(ProductPriceHistory, {
    foreignKey: 'product_id'
});

Product.hasMany(InventoryMovement, {
    foreignKey: 'product_id'
});

Product.belongsToMany(ProductTag, {
    through: 'product_tag_relations',
    foreignKey: 'product_id'
});

ProductTag.belongsToMany(Product, {
    through: 'product_tag_relations',
    foreignKey: 'tag_id'
});

Order.belongsTo(Shop, {
    foreignKey: 'shop_id'
});

Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'items'
});

OrderItem.belongsTo(Order, {
    foreignKey: 'order_id'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'product_id'
});

module.exports = {
    sequelize,
    ...models
};