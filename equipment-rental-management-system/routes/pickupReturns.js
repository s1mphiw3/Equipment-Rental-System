const express = require('express');
const router = express.Router();
const {
  createPickupReturn,
  processPickup,
  processReturn,
  getPickupReturnByRental,
  getPendingPickups,
  getPendingReturns,
  getOverdueReturns,
  getAllPickupReturns
} = require('../controllers/pickupReturnController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer routes
router.get('/rental/:rentalId', authenticateToken, getPickupReturnByRental);

// Staff routes
router.post('/', authenticateToken, requireRole(['admin', 'staff']), createPickupReturn);
router.put('/:id/pickup', authenticateToken, requireRole(['admin', 'staff']), processPickup);
router.put('/:id/return', authenticateToken, requireRole(['admin', 'staff']), processReturn);
router.get('/pending-pickups', authenticateToken, requireRole(['admin', 'staff']), getPendingPickups);
router.get('/pending-returns', authenticateToken, requireRole(['admin', 'staff']), getPendingReturns);
router.get('/overdue-returns', authenticateToken, requireRole(['admin', 'staff']), getOverdueReturns);

// Admin routes
router.get('/', authenticateToken, requireRole(['admin', 'staff']), getAllPickupReturns);

module.exports = router;
