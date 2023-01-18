module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['id'],
        },
      ],
      tableName: 'user',
      createdAt: true,
      updatedAt: true,
      timestamps: true,
      paranoid: true,
    }
  );

  user.associate = models => {
    user.hasOne(models.Attend, {
      foreignKey: 'id',
      sourceKey: 'id',
      as: 'attend',
    });
  };

  return user;
};
