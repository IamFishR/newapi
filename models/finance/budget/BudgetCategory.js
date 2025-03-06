const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class BudgetCategory extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.hasMany(models.Transaction, {
            foreignKey: 'category_id',
            as: 'transactions'
        });
    }
}

BudgetCategory.init({
    id: {
        type: DataTypes.STRING(36),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    user_id: {
        type: DataTypes.INTEGER,
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
    budgeted_amount: {
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
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'BudgetCategory',
    tableName: 'budget_categories',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'name']
        }
    ]
});

module.exports = BudgetCategory;