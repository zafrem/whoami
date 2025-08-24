const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool || {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const User = require('./User')(sequelize, Sequelize.DataTypes);
const Survey = require('./Survey')(sequelize, Sequelize.DataTypes);
const Result = require('./Result')(sequelize, Sequelize.DataTypes);
const Group = require('./Group')(sequelize, Sequelize.DataTypes);
const GroupComment = require('./GroupComment')(sequelize, Sequelize.DataTypes);
const LLMConfig = require('./LLMConfig')(sequelize, Sequelize.DataTypes);
const LLMLog = require('./LLMLog')(sequelize, Sequelize.DataTypes);

User.hasMany(Result, { foreignKey: 'userId', as: 'results' });
Result.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Survey.hasMany(Result, { foreignKey: 'surveyId', as: 'results' });
Result.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

if (Group.associate) {
  Group.associate({ User, Survey, Result, Group, GroupComment, LLMConfig, LLMLog });
}
if (GroupComment.associate) {
  GroupComment.associate({ User, Survey, Result, Group, GroupComment, LLMConfig, LLMLog });
}
if (User.associate) {
  User.associate({ User, Survey, Result, Group, GroupComment, LLMConfig, LLMLog });
}
if (LLMLog.associate) {
  LLMLog.associate({ User, Survey, Result, Group, GroupComment, LLMConfig, LLMLog });
}

module.exports = {
  sequelize,
  User,
  Survey,
  Result,
  Group,
  GroupComment,
  LLMConfig,
  LLMLog
};