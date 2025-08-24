module.exports = (sequelize, DataTypes) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Multilingual name object: {"en": "English Name", "ko": "Korean Name"}'
    },
    description: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Multilingual description object'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'personality'
    },
    language: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'en',
      comment: 'Primary language for this survey version'
    },
    questionsJson: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'questions_json',
      comment: 'Language-specific questions'
    },
    analysisJson: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'analysis_json',
      comment: 'Language-specific analysis configuration'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'estimated_time',
      comment: 'Estimated completion time in minutes'
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      defaultValue: 'medium'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    baseId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'base_id',
      comment: 'Base identifier to group different language versions of the same survey'
    },
    externalUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'external_url',
      validate: {
        isUrl: true
      },
      comment: 'External URL for surveys hosted on other platforms'
    },
    isExternal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_external',
      comment: 'Whether this survey is hosted externally'
    },
    surveyTypes: {
      type: DataTypes.JSONB,
      allowNull: true,
      field: 'survey_types',
      comment: 'Survey type configurations: {"simple": {"questions": 10, "time": 3}, "general": {"questions": 20, "time": 7}, "full": {"questions": 30, "time": 10}}'
    }
  }, {
    indexes: [
      {
        fields: ['language']
      },
      {
        fields: ['base_id', 'language'],
        unique: true
      },
      {
        fields: ['category', 'language']
      },
      {
        fields: ['is_active', 'language']
      }
    ]
  });

  // Instance method to get localized name
  Survey.prototype.getLocalizedName = function(language = 'en') {
    if (typeof this.name === 'object' && this.name !== null) {
      return this.name[language] || this.name.en || this.name[Object.keys(this.name)[0]] || 'Untitled Survey';
    }
    return this.name || 'Untitled Survey';
  };

  // Instance method to get localized description
  Survey.prototype.getLocalizedDescription = function(language = 'en') {
    if (typeof this.description === 'object' && this.description !== null) {
      return this.description[language] || this.description.en || this.description[Object.keys(this.description)[0]] || '';
    }
    return this.description || '';
  };

  return Survey;
};