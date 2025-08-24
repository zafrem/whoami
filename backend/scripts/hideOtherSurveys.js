require('dotenv').config();
const { sequelize, Survey } = require('../models');

const hideOtherSurveys = async () => {
  console.log('🔒 Hiding other surveys to show only Adaptive survey...');

  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Make all surveys inactive first
    await Survey.update(
      { isActive: false },
      { where: {} }
    );
    console.log('📝 Set all surveys to inactive');

    // Activate only the Adaptive survey
    const adaptiveSurvey = await Survey.findOne({
      where: { baseId: 'test-adaptive' }
    });

    if (adaptiveSurvey) {
      await adaptiveSurvey.update({ isActive: true });
      console.log('✅ Activated Test Survey - Adaptive');
    } else {
      console.log('⚠️  Adaptive survey not found');
    }

    // Get count of active surveys
    const activeSurveyCount = await Survey.count({ where: { isActive: true } });
    console.log(`📊 Active surveys: ${activeSurveyCount}`);

    // List all surveys and their status
    const allSurveys = await Survey.findAll({
      attributes: ['id', 'name', 'baseId', 'isActive'],
      order: [['baseId', 'ASC']]
    });

    console.log('\n📋 Survey Status:');
    allSurveys.forEach(survey => {
      const name = typeof survey.name === 'string' ? survey.name : survey.name.en;
      const status = survey.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
      console.log(`  ${status} - ${name} (${survey.baseId})`);
    });

    console.log('\n🎉 Survey visibility updated successfully!');
    console.log('💡 Only the Adaptive survey is now visible to users.');

  } catch (error) {
    console.error('❌ Error updating survey visibility:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run the script
hideOtherSurveys().catch(console.error);