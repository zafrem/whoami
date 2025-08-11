const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const {
  getAllSurveys,
  getSurvey,
  getSurveyQuestions,
  getSurveyStats,
  createSurvey,
  updateSurvey,
  deleteSurvey
} = require('../controllers/surveyController');

const router = express.Router();

router.get('/', getAllSurveys);
router.get('/:id', getSurvey);
router.get('/:id/questions', getSurveyQuestions);
router.get('/:id/stats', getSurveyStats);

router.post('/', auth, createSurvey);
router.put('/:id', auth, updateSurvey);
router.delete('/:id', auth, deleteSurvey);

module.exports = router;