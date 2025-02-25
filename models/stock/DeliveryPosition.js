const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class DeliveryPosition extends Model {
        static associate(models) {
            DeliveryPosition.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    DeliveryPosition.init({
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        date: {
            type: DataTypes.DATEONLY,
            primaryKey: true
        },
        quantity_traded: {
            type: DataTypes.BIGINT
        },
        delivery_quantity: {
            type: DataTypes.BIGINT
        },
        delivery_percentage: {
            type: DataTypes.DECIMAL(10, 2)
        }
    }, {
        sequelize,
        modelName: 'DeliveryPosition',
        tableName: 'delivery_positions',
        timestamps: false
    });

    return DeliveryPosition;
};