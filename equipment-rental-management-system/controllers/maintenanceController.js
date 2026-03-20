const Maintenance = require('../models/Maintenance');
const Equipment = require('../models/Equipment');

// Get all maintenance records
const getAllMaintenance = async (req, res) => {
  try {
    const filters = req.query;
    const maintenance = await Maintenance.findAll(filters);

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get all maintenance error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

// Get maintenance by ID
const getMaintenanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const maintenance = await Maintenance.findById(id);

    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance record' });
  }
};

// Create new maintenance record
const createMaintenance = async (req, res) => {
  try {
    const maintenanceData = req.body;

    // Validate required fields
    if (!maintenanceData.equipment_id || !maintenanceData.maintenance_date || !maintenanceData.description) {
      return res.status(400).json({
        error: 'Equipment ID, maintenance date, and description are required'
      });
    }

    // Check if equipment exists
    const equipment = await Equipment.findById(maintenanceData.equipment_id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const maintenanceId = await Maintenance.create(maintenanceData);

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      data: { id: maintenanceId }
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    res.status(500).json({ error: 'Failed to create maintenance record' });
  }
};

// Update maintenance record
const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const success = await Maintenance.update(id, updateData);

    if (!success) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({
      success: true,
      message: 'Maintenance record updated successfully'
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ error: 'Failed to update maintenance record' });
  }
};

// Delete maintenance record
const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const success = await Maintenance.delete(id);

    if (!success) {
      return res.status(404).json({ error: 'Maintenance record not found' });
    }

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({ error: 'Failed to delete maintenance record' });
  }
};

// Get upcoming maintenance
const getUpcomingMaintenance = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const maintenance = await Maintenance.getUpcomingMaintenance(days);

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get upcoming maintenance error:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming maintenance' });
  }
};

// Get overdue maintenance
const getOverdueMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.getOverdueMaintenance();

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get overdue maintenance error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue maintenance' });
  }
};

// Get maintenance history for equipment
const getMaintenanceHistory = async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const maintenance = await Maintenance.getMaintenanceHistory(equipmentId);

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get maintenance history error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance history' });
  }
};

// Get maintenance costs analytics
const getMaintenanceCosts = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required'
      });
    }

    const costs = await Maintenance.getMaintenanceCosts(startDate, endDate);

    res.json({
      success: true,
      data: costs
    });
  } catch (error) {
    console.error('Get maintenance costs error:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance costs' });
  }
};

// Get next maintenance dates
const getNextMaintenanceDates = async (req, res) => {
  try {
    const maintenance = await Maintenance.getNextMaintenanceDates();

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Get next maintenance dates error:', error);
    res.status(500).json({ error: 'Failed to fetch next maintenance dates' });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getUpcomingMaintenance,
  getOverdueMaintenance,
  getMaintenanceHistory,
  getMaintenanceCosts,
  getNextMaintenanceDates
};
