module.exports = (sequelize, DataTypes) => {
  const LLMConfig = sequelize.define('LLMConfig', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    provider: {
      type: DataTypes.ENUM('claude', 'gemini', 'openai', 'ollama'),
      allowNull: false
    },
    apiKey: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    apiEndpoint: {
      type: DataTypes.STRING,
      allowNull: true
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    config: {
      type: DataTypes.JSONB,
      allowNull: true
    }
  }, {
    indexes: [
      {
        fields: ['provider'],
        unique: false
      },
      {
        fields: ['isActive'],
        unique: false
      }
    ]
  });

  return LLMConfig;
};