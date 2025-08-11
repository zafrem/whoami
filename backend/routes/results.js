const express = require('express');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const {
  submitResult,
  getUserResults,
  getResult,
  compareResults,
  exportResult
} = require('../controllers/resultController');

const router = express.Router();

router.post('/', optionalAuth, validate(schemas.submitAnswer), submitResult);
router.get('/', auth, getUserResults);
router.get('/:id', optionalAuth, getResult);
router.get('/:resultId1/compare/:resultId2', auth, compareResults);
router.get('/:id/export', auth, exportResult);

module.exports = router;