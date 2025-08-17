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
  updateUser
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

module.exports = router;