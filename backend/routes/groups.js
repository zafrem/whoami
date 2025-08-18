const express = require('express');
const groupController = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', groupController.getGroups);
router.get('/matching-info', groupController.getMatchingInfo);
router.get('/user', auth, groupController.getUserGroups);
router.get('/:id', groupController.getGroup);
router.post('/', auth, groupController.createGroup);
router.post('/:id/join', auth, groupController.joinGroup);
router.delete('/:id/leave', auth, groupController.leaveGroup);
router.delete('/:id', auth, groupController.deleteGroup);
// LLM-powered matching
router.post('/:id/match', auth, groupController.performGroupMatching);
router.get('/:id/matching-history', auth, groupController.getGroupMatchingHistory);

module.exports = router;