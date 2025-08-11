module.exports = (sequelize, DataTypes) => {
  const Result = sequelize.define('Result', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      field: 'user_id'
    },
    surveyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Surveys',
        key: 'id'
      },
      field: 'survey_id'
    },
    answersJson: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'answers_json'
    },
    resultsJson: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'results_json'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'completed_at'
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'time_spent',
      comment: 'Time spent in seconds'
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_completed'
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'session_id'
    }
  }, {
    indexes: [
      {
        fields: ['user_id', 'survey_id']
      },
      {
        fields: ['completed_at']
      },
      {
        fields: ['session_id']
      }
    ]
  });

  return Result;
};