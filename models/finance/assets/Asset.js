const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class Asset extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
    }
}

Asset.init({
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
        allowNull: true
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
            fields: ['user_id', 'category']
        },
        {
            fields: ['user_id', 'last_updated']
        }
    ]
});

module.exports = Asset;