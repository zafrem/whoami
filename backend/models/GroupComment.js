module.exports = (sequelize, DataTypes) => {
  const GroupComment = sequelize.define('GroupComment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000]
      }
    },
    isVisible: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  GroupComment.associate = function(models) {
    GroupComment.belongsTo(models.Group, {
      foreignKey: 'groupId',
      as: 'group'
    });
    GroupComment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'author'
    });
  };

  return GroupComment;
};