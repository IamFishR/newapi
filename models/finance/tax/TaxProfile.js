const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../../index');

class TaxProfile extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: 'user_id',
            onDelete: 'CASCADE'
        });
        this.hasMany(models.TaxDeduction, {
            foreignKey: 'tax_profile_id'
        });
    }
}

TaxProfile.init({
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
    tax_year: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 2000,
            max: 2100
        }
    },
    filing_status: {
        type: DataTypes.ENUM('single', 'married_joint', 'married_separate', 'head_household'),
        allowNull: false
    },
    estimated_income: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    estimated_deductions: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    estimated_tax_credits: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    withholding_amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    estimated_tax_liability: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'TaxProfile',
    tableName: 'tax_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'tax_year']
        }
    ]
});

module.exports = TaxProfile;