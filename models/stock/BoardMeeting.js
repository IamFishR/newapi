const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class BoardMeeting extends Model {
        static associate(models) {
            BoardMeeting.belongsTo(models.Company, { foreignKey: 'symbol' });
        }
    }

    BoardMeeting.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        symbol: {
            type: DataTypes.STRING(20),
            allowNull: false,
            references: {
                model: 'companies',
                key: 'symbol'
            }
        },
        meeting_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        purpose: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'BoardMeeting',
        tableName: 'board_meetings',
        timestamps: false
    });

    return BoardMeeting;
};