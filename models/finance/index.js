const { sequelize } = require('../index');
const profileModels = require('./profile');
const budgetModels = require('./budget');
const investmentModels = require('./investments');
const debtModels = require('./debt');
const goalModels = require('./goals');
const assetModels = require('./assets');
const taxModels = require('./tax');

// Initialize associations after all models are loaded
const models = {
    ...profileModels,
    ...budgetModels,
    ...investmentModels,
    ...debtModels,
    ...goalModels,
    ...assetModels,
    ...taxModels
};

// Run model associations
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(sequelize.models));

module.exports = models;