const express = require('express');
const router = express.Router();
const {
  generateAgreement,
  getAgreement,
  downloadAgreement,
  signAgreement,
  getAllAgreements
} = require('../controllers/rentalAgreementController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Customer routes
router.post('/:rentalId/generate', authenticateToken, generateAgreement);
router.get('/:rentalId', authenticateToken, getAgreement);
router.get('/:rentalId/download', authenticateToken, downloadAgreement);
router.put('/:rentalId/sign', authenticateToken, signAgreement);

// Admin/Staff routes
router.get('/', authenticateToken, requireRole(['admin', 'staff']), getAllAgreements);

module.exports = router;
