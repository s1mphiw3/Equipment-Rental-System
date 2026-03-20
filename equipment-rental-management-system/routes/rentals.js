const express = require('express');
const router = express.Router();
const {
  createRental,
  getUserRentals,
  getAllRentals,
  getRentalById,
  updateRentalStatus,
  cancelRental
} = require('../controllers/rentalController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer routes
router.post('/', authenticateToken, createRental);
router.get('/my-rentals', authenticateToken, getUserRentals);
router.get('/:id', authenticateToken, getRentalById);
router.put('/:id/cancel', authenticateToken, cancelRental);

// Admin/Staff routes
router.get('/', authenticateToken, requireRole(['admin', 'staff']), getAllRentals);
router.put('/:id/status', authenticateToken, requireRole(['admin', 'staff']), updateRentalStatus);

module.exports = router;