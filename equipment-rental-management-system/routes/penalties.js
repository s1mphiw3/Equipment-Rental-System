const express = require('express');
const router = express.Router();
const {
  createPenalty,
  getPenaltiesByRental,
  getPenalty,
  payPenalty,
  simulatePayPenalty,
  calculateLateReturnPenalty,
  applyLateReturnPenalty,
  getAllPenalties,
  getUnpaidPenaltiesByRental,
  getPenaltySummary,
  getOverdueRentals
} = require('../controllers/penaltyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer routes
router.get('/rental/:rentalId', authenticateToken, getPenaltiesByRental);
router.get('/rental/:rentalId/unpaid', authenticateToken, getUnpaidPenaltiesByRental);
router.put('/:id/pay', authenticateToken, payPenalty);
router.put('/:id/simulate-pay', authenticateToken, simulatePayPenalty);

// Staff routes
router.post('/', authenticateToken, requireRole(['admin', 'staff']), createPenalty);
router.get('/overdue-rentals', authenticateToken, requireRole(['admin', 'staff']), getOverdueRentals);
router.get('/:rentalId/calculate-late', authenticateToken, requireRole(['admin', 'staff']), calculateLateReturnPenalty);
router.post('/:rentalId/apply-late', authenticateToken, requireRole(['admin', 'staff']), applyLateReturnPenalty);

// Admin routes
router.get('/', authenticateToken, requireRole(['admin', 'staff']), getAllPenalties);
router.get('/:id', authenticateToken, requireRole(['admin', 'staff']), getPenalty);
router.get('/summary/stats', authenticateToken, requireRole(['admin', 'staff']), getPenaltySummary);

module.exports = router;
