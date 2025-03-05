const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class TaxDeduction extends Model {
        static associate(models) {
            TaxDeduction.belongsTo(models.User, { foreignKey: 'userId' });
            TaxDeduction.belongsTo(models.TaxProfile, {
                foreignKey: 'taxProfileId',
                as: 'taxProfile'
            });
        }
    }

    TaxDeduction.init({
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
        taxProfileId: {
            type: DataTypes.UUID,
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
            allowNull: false
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
        documentUrls: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: []
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
        indexes: [
            {
                fields: ['userId']
            },
            {
                fields: ['taxProfileId']
            },
            {
                fields: ['category']
            },
            {
                fields: ['status']
            }
        ]
    });

    return TaxDeduction;
};