// `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
// `user_id` int NOT NULL,
// `account_number` varchar(50) NOT NULL,
// `account_name` varchar(100) DEFAULT NULL,
// `account_type` varchar(50) DEFAULT NULL COMMENT 'e.g., PRIME POTENTIAL, Savings, Current, etc.',
// `bank_name` varchar(100) NOT NULL,
// `branch_name` varchar(100) DEFAULT NULL,
// `ifsc_code` varchar(20) DEFAULT NULL,
// `micr_code` varchar(20) DEFAULT NULL,
// `currency` varchar(3) NOT NULL DEFAULT 'INR',
// `is_primary` tinyint(1) DEFAULT '0',
// `status` enum('active','inactive','closed') DEFAULT 'active',
// `opening_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
// `current_balance` decimal(15,2) NOT NULL DEFAULT '0.00',
// `last_synced_at` datetime DEFAULT NULL,
// `created_at` datetime NOT NULL,
// `updated_at` datetime NOT NULL,
// `deleted_at` datetime DEFAULT NULL,
// PRIMARY KEY (`id`),
// UNIQUE KEY `bank_accounts_account_number_bank_name` (`account_number`,`bank_name`),
// KEY `bank_accounts_user_id` (`user_id`),
// KEY `bank_accounts_status` (`status`),
// CONSTRAINT `bank_accounts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)

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
        account_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        account_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        account_type: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'Savings',
            comment: 'e.g., PRIME POTENTIAL, Savings, Current, etc.'
        },
        bank_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        branch_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        ifsc_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        micr_code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_primary: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'closed'),
            defaultValue: 'active'
        },
        opening_balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        current_balance: {
            type: DataTypes.DECIMAL(15, 2),
            defaultValue: 0
        },
        last_synced_at: {
            type: DataTypes.DATE
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
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