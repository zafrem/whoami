const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const {
  getDashboard,
  getAllSurveys,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getAllUsers,
  updateUser,
  getAllGroups,
  // LLM Configuration
  getLLMConfigs,
  createLLMConfig,
  updateLLMConfig,
  deleteLLMConfig,
  testLLMConfig,
  // LLM Logs
  getLLMLogs,
  getLLMLogDetail
} = require('../controllers/adminController');

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', getDashboard);

// Survey management
router.get('/surveys', getAllSurveys);
router.post('/surveys', createSurvey);
router.put('/surveys/:id', updateSurvey);
router.delete('/surveys/:id', deleteSurvey);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);

// Groups management
router.get('/groups', getAllGroups);

// LLM Configuration management
router.get('/llm-configs', getLLMConfigs);
router.post('/llm-configs', createLLMConfig);
router.put('/llm-configs/:id', updateLLMConfig);
router.delete('/llm-configs/:id', deleteLLMConfig);
router.post('/llm-configs/:id/test', testLLMConfig);

// LLM Logs management
router.get('/llm-logs', getLLMLogs);
router.get('/llm-logs/:id', getLLMLogDetail);

module.exports = router;