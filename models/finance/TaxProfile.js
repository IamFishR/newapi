const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaxProfile extends Model {
        static associate(models) {
            TaxProfile.belongsTo(models.User, { foreignKey: 'userId' });
            TaxProfile.hasMany(models.TaxDeduction, {
                foreignKey: 'taxProfileId',
                as: 'deductions'
            });
        }
    }

    TaxProfile.init({
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
        taxYear: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        filingStatus: {
            type: DataTypes.ENUM('single', 'married_joint', 'married_separate', 'head_household'),
            allowNull: false
        },
        estimatedIncome: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        estimatedDeductions: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        estimatedTaxCredits: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        withholdingAmount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        estimatedTaxLiability: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
            defaultValue: 0
        },
        lastUpdated: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'TaxProfile',
        tableName: 'tax_profiles',
        timestamps: true,
        indexes: [
            {
                fields: ['userId']
            },
            {
                unique: true,
                fields: ['userId', 'taxYear']
            }
        ]
    });

    return TaxProfile;
};