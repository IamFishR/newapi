const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BudgetCategory extends Model {
        static associate(models) {
            BudgetCategory.belongsTo(models.User, { foreignKey: 'userId' });
            BudgetCategory.hasMany(models.Transaction, { 
                foreignKey: 'categoryId',
                as: 'transactions'
            });
        }
    }

    BudgetCategory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        budgetedAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: true,
            validate: {
                is: /^#[0-9A-F]{6}$/i
            }
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'BudgetCategory',
        tableName: 'budget_categories',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                unique: true,
                fields: ['userId', 'name']
            }
        ]
    });

    return BudgetCategory;
};