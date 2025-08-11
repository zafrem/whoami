// Models for serverless functions
const { DataTypes } = require('sequelize');
const { getSequelize } = require('./_db');

// Initialize models
const initModels = () => {
  const sequelize = getSequelize();

  // User Model
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
      validate: {
        len: [3, 50],
        isAlphanumeric: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Users',
    timestamps: true
  });

  // Survey Model
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Multilingual name object: {"en": "English Name", "ko": "Korean Name"}'
    },
    description: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Multilingual description object'
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'personality'
    },
    language: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
      comment: 'Primary language for this survey version'
    },
    baseId: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Base identifier for grouping survey versions'
    },
    questionsJson: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    analysisJson: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      comment: 'Estimated completion time in minutes'
    },
    difficulty: {
      type: DataTypes.STRING(20),
      defaultValue: 'medium'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'Surveys',
    timestamps: true,
    indexes: [
      { fields: ['category'] },
      { fields: ['language'] },
      { fields: ['baseId'] },
      { fields: ['isActive'] }
    ]
  });

  // Result Model
  const Result = sequelize.define('Result', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: User,
        key: 'id'
      }
    },
    surveyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Survey,
        key: 'id'
      }
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Session ID for guest users'
    },
    answers: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    scores: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    personalityType: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      comment: 'Time spent in seconds'
    }
  }, {
    tableName: 'Results',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['surveyId'] },
      { fields: ['sessionId'] },
      { fields: ['completedAt'] }
    ]
  });

  // Define associations
  User.hasMany(Result, { foreignKey: 'userId', as: 'results' });
  Result.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  
  Survey.hasMany(Result, { foreignKey: 'surveyId', as: 'results' });
  Result.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

  return { User, Survey, Result, sequelize };
};

module.exports = { initModels };