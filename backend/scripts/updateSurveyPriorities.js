const fs = require('fs');
const path = require('path');

// Function to update a survey file with priorities
function updateSurveyWithPriorities(filePath) {
  try {
    const surveyData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      // Add priority to each question
      surveyData.questions.forEach((question, index) => {
        // Priority 1: First 10 questions (simple)
        // Priority 2: Next 10 questions (general)  
        // Priority 3: Last questions (full)
        if (index < 10) {
          question.priority = 1;
        } else if (index < 20) {
          question.priority = 2;
        } else {
          question.priority = 3;
        }
      });
      
      // Write back to file
      fs.writeFileSync(filePath, JSON.stringify(surveyData, null, 2));
      console.log(`✅ Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Update the test survey
const testSurveyPath = path.join(__dirname, '../surveys/test-survey-30.json');
updateSurveyWithPriorities(testSurveyPath);

console.log('🎉 Survey priority update completed!');