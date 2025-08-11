const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { sequelize, Survey } = require('../models');

const seedSurveys = async () => {
  console.log('🌱 Starting database seeding...');

  try {
    // Ensure database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    // Load survey files
    const surveysDir = path.join(__dirname, '../surveys');
    const surveyFiles = fs.readdirSync(surveysDir).filter(file => file.endsWith('.json'));

    console.log(`📂 Found ${surveyFiles.length} survey files to process.`);

    for (const filename of surveyFiles) {
      const filePath = path.join(surveysDir, filename);
      const surveyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Handle both old and new survey formats
      const surveyName = typeof surveyData.name === 'string' ? surveyData.name : surveyData.name.en;
      const surveyLanguage = surveyData.language || 'en';
      const baseId = surveyData.baseId || surveyName.toLowerCase().replace(/\s+/g, '-');

      // Check if survey already exists (check by baseId and language)
      const existingSurvey = await Survey.findOne({
        where: { 
          baseId: baseId,
          language: surveyLanguage
        }
      });

      if (existingSurvey) {
        console.log(`⚠️  Survey "${surveyName}" (${surveyLanguage}) already exists, skipping.`);
        continue;
      }

      // Create survey
      const survey = await Survey.create({
        name: surveyData.name,
        description: surveyData.description,
        category: surveyData.category,
        language: surveyLanguage,
        baseId: baseId,
        questionsJson: surveyData.questions,
        analysisJson: surveyData.analysis,
        estimatedTime: surveyData.estimatedTime,
        difficulty: surveyData.difficulty,
        tags: surveyData.tags,
        isActive: true
      });

      console.log(`✅ Created survey: ${surveyName} (${surveyLanguage})`);
    }

    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedSurveys()
    .then(() => {
      console.log('🏁 Seeding process finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedSurveys;