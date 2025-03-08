module.exports = (sequelize, DataTypes) => {
    const BankAccount = sequelize.define('BankAccount', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        account_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        opening_balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        current_balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'closed'),
            defaultValue: 'active'
        },
        last_synced_at: {
            type: DataTypes.DATE
        }
    }, {
        tableName: 'bank_accounts',
        timestamps: true,
        paranoid: true,
        underscored: true
    });

    BankAccount.associate = (models) => {
        BankAccount.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
        BankAccount.hasMany(models.Transaction, {
            foreignKey: 'account_id',
            as: 'transactions'
        });
    };

    return BankAccount;
};