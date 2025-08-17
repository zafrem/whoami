module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 20,
      validate: {
        min: 2,
        max: 20
      }
    },
    currentParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    matchingType: {
      type: DataTypes.ENUM('1:1', '1:N'),
      allowNull: false,
      defaultValue: '1:N'
    }
  });

  Group.associate = function(models) {
    Group.belongsTo(models.User, { 
      foreignKey: 'createdBy', 
      as: 'creator' 
    });
    Group.belongsToMany(models.User, { 
      through: 'GroupMembers',
      as: 'members',
      foreignKey: 'groupId'
    });
  };

  return Group;
};