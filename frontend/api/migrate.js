// Database migration and seeding script for Neon
const { connectWithRetry } = require('./_db');
const { initModels } = require('./_models');
const fs = require('fs');
const path = require('path');

const seedSurveys = async () => {
  console.log('🌱 Starting database migration and seeding...');

  try {
    // Connect to database
    const sequelize = await connectWithRetry();
    const { Survey } = initModels();
    
    console.log('✅ Database connection established.');

    // Sync models (create tables)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized.');

    // Load survey files from backend directory
    const backendSurveysDir = path.join(__dirname, '../../backend/surveys');
    let surveyFiles = [];
    
    try {
      surveyFiles = fs.readdirSync(backendSurveysDir).filter(file => file.endsWith('.json'));
    } catch (error) {
      console.log('⚠️  Backend surveys directory not found, using embedded survey data.');
      // If backend surveys aren't available, create basic surveys
      surveyFiles = [];
    }

    if (surveyFiles.length === 0) {
      // Create basic survey data if files aren't found
      const basicSurveys = [
        {
          name: { en: "MBTI Personality Test", ko: "MBTI 성격 유형 검사" },
          description: { en: "Discover your personality type", ko: "당신의 성격 유형을 발견하세요" },
          category: "personality",
          language: "en",
          baseId: "mbti",
          estimatedTime: 10,
          difficulty: "medium",
          tags: ["personality", "psychology"],
          questions: [
            {
              id: "q1",
              text: "You find it easy to introduce yourself to other people",
              type: "scale",
              dimension: "EI",
              options: [
                { value: 0, text: "Strongly Disagree" },
                { value: 1, text: "Disagree" },
                { value: 2, text: "Neutral" },
                { value: 3, text: "Agree" },
                { value: 4, text: "Strongly Agree" }
              ]
            }
          ],
          analysis: {
            dimensions: [
              {
                key: "EI",
                name: "Extraversion vs Introversion",
                questions: ["q1"],
                scoring: { 0: 0, 1: 25, 2: 50, 3: 75, 4: 100 }
              }
            ],
            resultTypes: [
              {
                dimension: "EI",
                categories: [
                  {
                    key: "I",
                    min: 0,
                    max: 49,
                    description: "Introversion: You prefer quiet reflection.",
                    traits: ["reflective", "reserved"]
                  },
                  {
                    key: "E", 
                    min: 50,
                    max: 100,
                    description: "Extraversion: You prefer social interaction.",
                    traits: ["outgoing", "social"]
                  }
                ]
              }
            ]
          }
        }
      ];

      for (const surveyData of basicSurveys) {
        const existingSurvey = await Survey.findOne({
          where: { 
            baseId: surveyData.baseId,
            language: surveyData.language
          }
        });

        if (!existingSurvey) {
          await Survey.create({
            name: surveyData.name,
            description: surveyData.description,
            category: surveyData.category,
            language: surveyData.language,
            baseId: surveyData.baseId,
            questionsJson: surveyData.questions,
            analysisJson: surveyData.analysis,
            estimatedTime: surveyData.estimatedTime,
            difficulty: surveyData.difficulty,
            tags: surveyData.tags,
            isActive: true
          });
          console.log(`✅ Created basic survey: ${surveyData.baseId}`);
        }
      }
    } else {
      // Process survey files from backend directory
      console.log(`📂 Found ${surveyFiles.length} survey files to process.`);

      for (const filename of surveyFiles) {
        const filePath = path.join(backendSurveysDir, filename);
        const surveyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // Handle both old and new survey formats
        const surveyName = typeof surveyData.name === 'string' ? surveyData.name : surveyData.name.en;
        const surveyLanguage = surveyData.language || 'en';
        const baseId = surveyData.baseId || surveyName.toLowerCase().replace(/\s+/g, '-');

        // Check if survey already exists
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
        await Survey.create({
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
    }

    console.log('🎉 Database migration and seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  seedSurveys()
    .then(() => {
      console.log('🏁 Migration process finished.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

module.exports = seedSurveys;