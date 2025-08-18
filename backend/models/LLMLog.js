module.exports = (sequelize, DataTypes) => {
  const LLMLog = sequelize.define('LLMLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider: {
      type: DataTypes.ENUM('claude', 'gemini', 'openai', 'ollama'),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    operation: {
      type: DataTypes.ENUM('matching_analysis', 'compatibility_check', 'group_recommendation'),
      allowNull: false
    },
    userHashes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    prompt: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    tokenUsage: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    processingTime: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    success: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    initiatedBy: {
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    indexes: [
      {
        fields: ['provider'],
        unique: false
      },
      {
        fields: ['operation'],
        unique: false
      },
      {
        fields: ['groupId'],
        unique: false
      },
      {
        fields: ['createdAt'],
        unique: false
      },
      {
        fields: ['userHashes'],
        using: 'gin'
      }
    ]
  });

  LLMLog.associate = function(models) {
    LLMLog.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
    LLMLog.belongsTo(models.User, { foreignKey: 'initiatedBy', as: 'initiator' });
  };

  return LLMLog;
};