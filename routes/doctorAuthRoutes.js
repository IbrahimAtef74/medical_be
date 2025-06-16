const express = require('express');
const router = express.Router();
const doctorAuthController = require('../controllers/doctorAuthController');

router.post('/login', doctorAuthController.loginDoctor);

module.exports = router;
