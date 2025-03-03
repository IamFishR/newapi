const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BudgetCategory extends Model {
        static associate(models) {
            // We'll add associations later as needed
        }
    }

    BudgetCategory.init({
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: true,
            validate: {
                is: /^#[0-9A-F]{6}$/i  // Validate hex color format
            }
        }
    }, {
        sequelize,
        modelName: 'BudgetCategory',
        tableName: 'budgetcategories',
        timestamps: true,
        paranoid: true,  // Enable soft deletes
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'  // Specify the name of the soft delete column
    });

    return BudgetCategory;
};