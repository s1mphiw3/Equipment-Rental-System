const express = require('express');
const router = express.Router();
const {
  createDamageReport,
  getDamageReportsByRental,
  getDamageReport,
  updateDamageReport,
  updateReportStatus,
  getAllDamageReports,
  getPendingReports,
  getDamageStatistics,
  deleteDamageReport,
  getEnhancedDamageStatistics,
  getDamageTrends,
  upload
} = require('../controllers/damageReportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer routes
router.post('/', authenticateToken, upload, createDamageReport);
router.get('/rental/:rentalId', authenticateToken, getDamageReportsByRental);

// Staff/Admin routes
router.get('/pending', authenticateToken, requireRole(['admin', 'staff']), getPendingReports);
router.get('/statistics', authenticateToken, requireRole(['admin', 'staff']), getDamageStatistics);
router.get('/enhanced-statistics', authenticateToken, requireRole(['admin', 'staff']), getEnhancedDamageStatistics);
router.get('/trends', authenticateToken, requireRole(['admin', 'staff']), getDamageTrends);
router.get('/:id', authenticateToken, requireRole(['admin', 'staff']), getDamageReport);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), upload, updateDamageReport);
router.put('/:id/status', authenticateToken, requireRole(['admin', 'staff']), updateReportStatus);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteDamageReport);

// Admin routes
router.get('/', getAllDamageReports); // Temporarily removed auth for testing pagination

module.exports = router;
