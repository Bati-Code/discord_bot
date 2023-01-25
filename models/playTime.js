module.exports = (sequelize, DataTypes) => {
  const playtime = sequelize.define(
    'Playtime',
    {
      seq: {
        type: DataTypes.INTEGER(15),
        autoIncrement: true,
        primaryKey: true,
      },
      id: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      enter: {
        type: DataTypes.DATE(6),
        allowNull: false,
      },
      check: {
        type: DataTypes.INTEGER(1),
        allowNull: false,
      },
      time: {
        type: DataTypes.INTEGER(15),
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      tableName: 'playtime',
      createdAt: true,
      updatedAt: true,
      timestamps: true,
      paranoid: true,
    }
  );

  playtime.associate = models =>
    playtime.belongsTo(models.User, {
      foreignKey: 'id',
      targetKey: 'id',
    });

  return playtime;
};
