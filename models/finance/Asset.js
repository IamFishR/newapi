const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Asset extends Model {
        static associate(models) {
            Asset.belongsTo(models.User, { foreignKey: 'userId' });
        }
    }

    Asset.init({
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
        category: {
            type: DataTypes.ENUM('cash', 'investments', 'property', 'vehicle', 'other'),
            allowNull: false
        },
        value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        purchaseValue: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        purchaseDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        lastUpdated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        valueHistory: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
        }
    }, {
        sequelize,
        modelName: 'Asset',
        tableName: 'assets',
        timestamps: true,
        paranoid: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['category']
            },
            {
                fields: ['lastUpdated']
            }
        ]
    });

    return Asset;
};