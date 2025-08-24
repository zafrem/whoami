const fs = require('fs');
const path = require('path');

// Read the original 30-question survey
const originalSurveyPath = path.join(__dirname, '../surveys/test-survey-30.json');
const originalSurvey = JSON.parse(fs.readFileSync(originalSurveyPath, 'utf8'));

// Create Simple Survey (10 questions - priority 1)
const simpleSurvey = {
  ...originalSurvey,
  name: {
    "en": "Test Survey - Simple (10 Questions)",
    "ko": "테스트 설문조사 - 간단 (10문항)"
  },
  description: {
    "en": "A quick personality assessment with 10 key questions covering essential traits.",
    "ko": "필수 특성을 다루는 10개의 핵심 질문으로 구성된 빠른 성격 평가입니다."
  },
  baseId: "test-simple",
  estimatedTime: 3,
  difficulty: "easy",
  tags: ["test", "personality", "quick", "simple"],
  questions: originalSurvey.questions.filter(q => q.priority === 1),
  // Remove surveyTypes since this is a fixed survey
  surveyTypes: undefined
};

// Create General Survey (20 questions - priority 1 & 2)
const generalSurvey = {
  ...originalSurvey,
  name: {
    "en": "Test Survey - General (20 Questions)",
    "ko": "테스트 설문조사 - 일반 (20문항)"
  },
  description: {
    "en": "A balanced personality assessment with 20 comprehensive questions for deeper insights.",
    "ko": "더 깊은 통찰을 위한 20개의 종합적인 질문으로 구성된 균형잡힌 성격 평가입니다."
  },
  baseId: "test-general",
  estimatedTime: 7,
  difficulty: "medium",
  tags: ["test", "personality", "balanced", "general"],
  questions: originalSurvey.questions.filter(q => q.priority <= 2),
  surveyTypes: undefined
};

// Update Full Survey (30 questions - all priorities)
const fullSurvey = {
  ...originalSurvey,
  name: {
    "en": "Test Survey - Full (30 Questions)",
    "ko": "테스트 설문조사 - 전체 (30문항)"
  },
  description: {
    "en": "A comprehensive personality assessment with all 30 detailed questions for complete analysis.",
    "ko": "완전한 분석을 위한 30개의 상세한 질문으로 구성된 종합적인 성격 평가입니다."
  },
  baseId: "test-full",
  estimatedTime: 10,
  difficulty: "hard",
  tags: ["test", "personality", "comprehensive", "detailed"],
  surveyTypes: undefined
};

// Update analysis to work with filtered questions
function updateAnalysis(survey) {
  const questionIds = survey.questions.map(q => q.id);
  
  // Filter analysis dimensions to only include questions that exist in this survey
  survey.analysis.dimensions = survey.analysis.dimensions.map(dim => ({
    ...dim,
    questions: dim.questions.filter(qId => questionIds.includes(qId))
  })).filter(dim => dim.questions.length > 0); // Remove dimensions with no questions
  
  return survey;
}

// Apply analysis updates
updateAnalysis(simpleSurvey);
updateAnalysis(generalSurvey);
updateAnalysis(fullSurvey);

// Write the survey files
const surveysDir = path.join(__dirname, '../surveys');

fs.writeFileSync(
  path.join(surveysDir, 'test-survey-simple.json'),
  JSON.stringify(simpleSurvey, null, 2)
);

fs.writeFileSync(
  path.join(surveysDir, 'test-survey-general.json'),
  JSON.stringify(generalSurvey, null, 2)
);

fs.writeFileSync(
  path.join(surveysDir, 'test-survey-full.json'),
  JSON.stringify(fullSurvey, null, 2)
);

console.log('✅ Created test-survey-simple.json (10 questions)');
console.log('✅ Created test-survey-general.json (20 questions)');
console.log('✅ Created test-survey-full.json (30 questions)');

console.log('\n📊 Survey Statistics:');
console.log(`Simple: ${simpleSurvey.questions.length} questions, ${simpleSurvey.analysis.dimensions.length} dimensions`);
console.log(`General: ${generalSurvey.questions.length} questions, ${generalSurvey.analysis.dimensions.length} dimensions`);
console.log(`Full: ${fullSurvey.questions.length} questions, ${fullSurvey.analysis.dimensions.length} dimensions`);

console.log('\n🎉 All survey types created successfully!');