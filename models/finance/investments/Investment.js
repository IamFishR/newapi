const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class Investment extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.hasMany(models.InvestmentTransaction, {
            foreignKey: 'investment_id'
        });
    }
}

Investment.init({
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
    symbol: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    shares: {
        type: DataTypes.DECIMAL(15, 6),
        allowNull: false,
        defaultValue: 0
    },
    average_cost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    type: {
        type: DataTypes.ENUM('stock', 'etf', 'mutual_fund', 'crypto', 'other'),
        allowNull: false
    },
    purchase_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    current_price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    last_price_update: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Investment',
    tableName: 'investments',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'symbol']
        },
        {
            fields: ['user_id', 'type']
        }
    ]
});

module.exports = Investment;