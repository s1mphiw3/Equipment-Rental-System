const express = require('express');
const router = express.Router();
const {
  createPenaltyPaymentIntent,
  confirmPenaltyPayment,
  getPenaltyPayments
} = require('../controllers/penaltyPaymentController');
const { authenticateToken } = require('../middleware/auth');

// Customer routes
router.post('/create-intent', authenticateToken, createPenaltyPaymentIntent);
router.post('/confirm', authenticateToken, confirmPenaltyPayment);
router.get('/penalty/:penaltyId', authenticateToken, getPenaltyPayments);

module.exports = router;
