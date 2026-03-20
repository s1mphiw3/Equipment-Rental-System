const express = require('express');
const router = express.Router();
const {
  getEquipmentUtilization,
  getCustomerBookingPatterns,
  getRevenueAnalytics,
  getTopCategories
} = require('../controllers/analyticsController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All analytics routes require admin/staff authentication
router.get('/equipment-utilization', authenticateToken, requireRole(['admin', 'staff']), getEquipmentUtilization);
router.get('/customer-booking-patterns', authenticateToken, requireRole(['admin', 'staff']), getCustomerBookingPatterns);
router.get('/revenue-analytics', authenticateToken, requireRole(['admin', 'staff','customers']), getRevenueAnalytics);
router.get('/top-categories', getTopCategories);

module.exports = router;
