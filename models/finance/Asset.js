const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Asset extends Model {
        static associate(models) {
            Asset.belongsTo(models.User, { foreignKey: 'user_id' });
        }
    }

    Asset.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
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
        purchase_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true
        },
        purchase_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        last_updated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        value_history: {
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
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['category']
            },
            {
                fields: ['last_updated']
            }
        ]
    });

    return Asset;
};