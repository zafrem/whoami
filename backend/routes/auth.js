const express = require('express');
const { validate, schemas } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refresh
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', refresh);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, validate(schemas.updateProfile), updateProfile);
router.put('/change-password', auth, validate(schemas.changePassword), changePassword);

module.exports = router;