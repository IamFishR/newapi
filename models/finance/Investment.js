const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Investment extends Model {
        static associate(models) {
            Investment.belongsTo(models.User, { foreignKey: 'userId' });
            Investment.hasMany(models.InvestmentTransaction, {
                foreignKey: 'investmentId',
                as: 'transactions'
            });
        }
    }

    Investment.init({
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
        symbol: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        shares: {
            type: DataTypes.DECIMAL(15, 6),
            allowNull: false,
            defaultValue: 0
        },
        averageCost: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        type: {
            type: DataTypes.ENUM('stock', 'etf', 'mutual_fund', 'crypto', 'other'),
            allowNull: false
        },
        purchaseDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        currentPrice: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        lastPriceUpdate: {
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
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['symbol']
            },
            {
                fields: ['type']
            }
        ]
    });

    return Investment;
};