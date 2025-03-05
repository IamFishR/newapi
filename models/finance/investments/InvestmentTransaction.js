const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class InvestmentTransaction extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.belongsTo(models.Investment, {
            foreignKey: 'investment_id',
            onDelete: 'CASCADE'
        });
    }
}

InvestmentTransaction.init({
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
    investment_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'investments',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('buy', 'sell'),
        allowNull: false
    },
    shares: {
        type: DataTypes.DECIMAL(15, 6),
        allowNull: false,
        validate: {
            notNull: true,
            notEqual: 0
        }
    },
    price_per_share: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        validate: {
            notNull: true,
            gt: 0
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'InvestmentTransaction',
    tableName: 'investment_transactions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['investment_id', 'date']
        },
        {
            fields: ['user_id', 'date']
        }
    ]
});

module.exports = InvestmentTransaction;