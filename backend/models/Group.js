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
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    publicScope: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Public scope criteria: { countries: [], minAge: null, maxAge: null, regions: [] }'
    },
    retentionHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 336 // 2 weeks max (14 days * 24 hours)
      },
      comment: 'Hours after creation when group becomes creator-only'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Calculated expiration timestamp based on retentionHours'
    }
  });

  // Instance methods
  Group.prototype.isExpired = function() {
    return this.expiresAt && new Date() > this.expiresAt;
  };

  Group.prototype.canUserAccess = function(userId) {
    // If no retention time set, always accessible
    if (!this.retentionHours || !this.expiresAt) {
      return true;
    }
    
    // If not expired, accessible to all members
    if (!this.isExpired()) {
      return true;
    }
    
    // If expired, only creator can access
    return this.createdBy === userId;
  };

  // Hook to calculate expiresAt when retentionHours is set
  Group.beforeCreate((group) => {
    if (group.retentionHours) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + group.retentionHours);
      group.expiresAt = expirationDate;
    }
  });

  Group.beforeUpdate((group) => {
    if (group.changed('retentionHours') && group.retentionHours) {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + group.retentionHours);
      group.expiresAt = expirationDate;
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
    Group.hasMany(models.GroupComment, {
      foreignKey: 'groupId',
      as: 'comments'
    });
  };

  return Group;
};