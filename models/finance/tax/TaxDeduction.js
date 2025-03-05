const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class TaxDeduction extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.belongsTo(models.TaxProfile, {
            foreignKey: 'tax_profile_id',
            onDelete: 'CASCADE'
        });
    }
}

TaxDeduction.init({
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
    tax_profile_id: {
        type: DataTypes.STRING(36),
        allowNull: false,
        references: {
            model: 'tax_profiles',
            key: 'id'
        }
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    amount: {
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
    },
    status: {
        type: DataTypes.ENUM('verified', 'pending'),
        allowNull: false,
        defaultValue: 'pending'
    },
    document_urls: {
        type: DataTypes.JSON,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'TaxDeduction',
    tableName: 'tax_deductions',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
        {
            fields: ['tax_profile_id', 'date']
        },
        {
            fields: ['user_id', 'category']
        },
        {
            fields: ['status']
        }
    ]
});

module.exports = TaxDeduction;