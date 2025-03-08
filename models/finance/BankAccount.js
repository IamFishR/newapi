const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BankAccount extends Model {
        static associate(models) {
            BankAccount.belongsTo(models.User, { foreignKey: 'user_id' });
            BankAccount.hasMany(models.Transaction, { foreignKey: 'account_id', as: 'transactions' });
        }
    }

    BankAccount.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER, // Changed from UUID to INTEGER to match users table
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        account_number: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        account_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        account_type: {
            type: DataTypes.STRING(50),
            allowNull: true,
            comment: 'e.g., PRIME POTENTIAL, Savings, Current, etc.'
        },
        bank_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        branch_name: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        ifsc_code: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        micr_code: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        currency: {
            type: DataTypes.STRING(3),
            defaultValue: 'INR',
            allowNull: false,
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            comment: 'Flag to mark primary account'
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'closed'),
            defaultValue: 'active',
        },
        opening_balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0.00,
            allowNull: false
        },
        current_balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0.00,
            allowNull: false
        },
        last_synced_at: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'BankAccount',
        tableName: 'bank_accounts',
        timestamps: true,
        paranoid: true,
        underscored: true,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['account_number', 'bank_name'],
                unique: true
            },
            {
                fields: ['status']
            }
        ]
    });

    return BankAccount;
};