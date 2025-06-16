const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../controllers/authController'); 

const router = express.Router();

router.post('/create-checkout-session', protect, paymentController.createCheckoutSession);
router.post('/mock-success', protect, paymentController.mockPaymentSuccess);

module.exports = router;
