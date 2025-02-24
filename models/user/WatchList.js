const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class WatchList extends Model {
        static associate(models) {
            WatchList.belongsTo(models.User, { foreignKey: 'user_id' });
            WatchList.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    WatchList.init({
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        symbol: {
            type: DataTypes.STRING(20),
            primaryKey: true,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        }
    }, {
        sequelize,
        modelName: 'WatchList',
        tableName: 'watchlist',
        timestamps: false
    });

    return WatchList;
}