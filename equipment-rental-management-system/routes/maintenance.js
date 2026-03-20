const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// All maintenance routes require authentication
router.use(authenticateToken);

// Admin and staff can access maintenance routes
router.use(requireRole(['admin', 'staff']));

// Get all maintenance records
router.get('/', maintenanceController.getAllMaintenance);

// Get upcoming maintenance
router.get('/upcoming', maintenanceController.getUpcomingMaintenance);

// Get overdue maintenance
router.get('/overdue', maintenanceController.getOverdueMaintenance);

// Get next maintenance dates
router.get('/next-dates', maintenanceController.getNextMaintenanceDates);

// Get maintenance costs analytics
router.get('/costs', maintenanceController.getMaintenanceCosts);

// Get maintenance history for specific equipment
router.get('/equipment/:equipmentId', maintenanceController.getMaintenanceHistory);

// Get maintenance by ID
router.get('/:id', maintenanceController.getMaintenanceById);

// Create new maintenance record
router.post('/', maintenanceController.createMaintenance);

// Update maintenance record
router.put('/:id', maintenanceController.updateMaintenance);

// Delete maintenance record
router.delete('/:id', maintenanceController.deleteMaintenance);

module.exports = router;
