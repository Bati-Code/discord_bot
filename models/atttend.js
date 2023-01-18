module.exports = (sequelize, DataTypes) => {
  const attend = sequelize.define(
    'Attend',
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
      date: {
        type: DataTypes.DATE(6),
        allowNull: false,
      },
    },
    {
      tableName: 'attend',
      createdAt: true,
      updatedAt: true,
      timestamps: true,
      paranoid: true,
    }
  );

  attend.associate = models =>
    attend.belongsTo(models.User, {
      foreignKey: 'id',
      targetKey: 'id',
    });

  return attend;
};
