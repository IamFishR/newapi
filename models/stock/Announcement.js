const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Announcement extends Model {
        static associate(models) {
            Announcement.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    Announcement.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        symbol: {
            type: DataTypes.STRING(20),
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        broadcast_date: {
            type: DataTypes.DATE
        },
        subject: {
            type: DataTypes.TEXT
        }
    }, {
        sequelize,
        modelName: 'Announcement',
        tableName: 'announcements',
        timestamps: false
    });

    return Announcement;
};