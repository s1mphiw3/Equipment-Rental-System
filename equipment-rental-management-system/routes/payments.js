const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  getRentalPayments,
  refundPayment
} = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer routes
router.post('/create-intent', authenticateToken, createPaymentIntent);
router.post('/confirm', authenticateToken, confirmPayment);
router.get('/rental/:rentalId', authenticateToken, getRentalPayments);

// Admin only routes
router.post('/:paymentId/refund', authenticateToken, requireRole(['admin']), refundPayment);

module.exports = router;