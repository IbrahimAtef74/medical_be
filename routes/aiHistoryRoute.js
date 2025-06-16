const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiHistoryController');
const { protect } = require('../controllers/authController');


router.post('/chat-with-history', protect, chatWithAI);

module.exports = router;
