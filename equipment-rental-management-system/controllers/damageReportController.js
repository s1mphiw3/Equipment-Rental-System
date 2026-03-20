const DamageReport = require('../models/DamageReport');
const Rental = require('../models/Rental');
const Penalty = require('../models/Penalty');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'damage-reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `damage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const createDamageReport = async (req, res) => {
  try {
    const { rental_id, damage_description, severity_level, estimated_cost, actual_cost } = req.body;

    // Check if rental exists
    const rental = await Rental.findById(rental_id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check permissions - staff or customer who owns the rental
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Process uploaded images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        imageUrls.push(`uploads/damage-reports/${file.filename}`);
      });
    }

    // Create damage report
    const reportId = await DamageReport.create({
      rental_id,
      reported_by: req.user.id,
      damage_description,
      severity_level,
      estimated_cost: parseFloat(estimated_cost) || 0,
      actual_cost: actual_cost ? parseFloat(actual_cost) : null,
      image_urls: imageUrls
    });

    // Automatically create penalty if actual_cost is provided and > 0
    if (actual_cost && parseFloat(actual_cost) > 0) {
      try {
        await Penalty.applyDamagePenalty(rental_id, parseFloat(actual_cost), `Damage repair cost: ${damage_description}`);
      } catch (penaltyError) {
        console.error('Failed to create damage penalty:', penaltyError);
        // Don't fail the entire request if penalty creation fails
      }
    }

    // Update rental to mark it has damage report
    await require('../config/database').execute(
      'UPDATE rentals SET has_damage_report = TRUE WHERE id = ?',
      [rental_id]
    );

    const report = await DamageReport.findById(reportId);

    res.status(201).json({
      success: true,
      message: 'Damage report created successfully',
      data: report
    });
  } catch (error) {
    console.error('Create damage report error:', error);
    res.status(500).json({ error: 'Failed to create damage report' });
  }
};

const getDamageReportsByRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reports = await DamageReport.findByRentalId(rentalId);

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get damage reports by rental error:', error);
    res.status(500).json({ error: 'Failed to fetch damage reports' });
  }
};

const getDamageReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await DamageReport.findById(id);
    if (!report) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    // Check permissions
    const rental = await Rental.findById(report.rental_id);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get damage report error:', error);
    res.status(500).json({ error: 'Failed to fetch damage report' });
  }
};

const updateDamageReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Get existing report
    const existingReport = await DamageReport.findById(id);
    if (!existingReport) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    // Check permissions - only staff can update reports
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `uploads/damage-reports/${file.filename}`);
      const existingImages = existingReport.image_urls ? JSON.parse(existingReport.image_urls) : [];
      updateData.image_urls = [...existingImages, ...newImageUrls];
    }

    await DamageReport.update(id, updateData);

    const updatedReport = await DamageReport.findById(id);

    res.json({
      success: true,
      message: 'Damage report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Update damage report error:', error);
    res.status(500).json({ error: 'Failed to update damage report' });
  }
};

const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, repair_notes, actual_cost } = req.body;

    // Check permissions - only staff can update status
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await DamageReport.updateStatus(id, status, repair_notes, actual_cost);

    if (!updated) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    const report = await DamageReport.findById(id);

    // Automatically create penalty when actual_cost is set and > 0
    if (actual_cost && parseFloat(actual_cost) > 0) {
      try {
        await Penalty.applyDamagePenalty(report.rental_id, parseFloat(actual_cost), `Damage repair cost: ${report.damage_description}`);
      } catch (penaltyError) {
        console.error('Failed to create damage penalty:', penaltyError);
        // Don't fail the entire request if penalty creation fails
      }
    }

    res.json({
      success: true,
      message: `Damage report status updated to ${status}`,
      data: report
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ error: 'Failed to update report status' });
  }
};

const getAllDamageReports = async (req, res) => {
  try {
    const { status, severity_level, reported_by, page = 1, limit = 10 } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (severity_level) filters.severity_level = severity_level;
    if (reported_by) filters.reported_by = reported_by;

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };

    const result = await DamageReport.findAll(filters, pagination);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get all damage reports error:', error);
    res.status(500).json({ error: 'Failed to fetch damage reports' });
  }
};

const getPendingReports = async (req, res) => {
  try {
    const reports = await DamageReport.getPendingReports();

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get pending reports error:', error);
    res.status(500).json({ error: 'Failed to fetch pending reports' });
  }
};

const getDamageStatistics = async (req, res) => {
  try {
    const severityStats = await DamageReport.getReportsBySeverity();
    const costStats = await DamageReport.getTotalDamageCost();

    res.json({
      success: true,
      data: {
        severity_breakdown: severityStats,
        total_costs: costStats
      }
    });
  } catch (error) {
    console.error('Get damage statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch damage statistics' });
  }
};

const getRepairedReports = async (req, res) => {
  try {
    const repairedReports = await DamageReport.getRepairedReports();
    res.json({
      success: true,
      data: repairedReports
    });
  } catch (error) {
    console.error('Get repaired reports error:', error);
    res.status(500).json({ error: 'Failed to fetch repaired reports' });
  }
};

const getEnhancedDamageStatistics = async (req, res) => {
  try {
    const severityStats = await DamageReport.getReportsBySeverity();
    const costStats = await DamageReport.getTotalDamageCost();
    const pendingReports = await DamageReport.getPendingReports();
    const repairedReports = await DamageReport.getRepairedReports();

    res.json({
      success: true,
      data: {
        severity_breakdown: severityStats,
        total_costs: costStats,
        pending_count: pendingReports.length,
        repaired_count: repairedReports.length
      }
    });
  } catch (error) {
    console.error('Get enhanced damage statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch enhanced damage statistics' });
  }
};

const deleteDamageReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Check permissions - only staff can delete reports
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deleted = await DamageReport.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Damage report not found' });
    }

    res.json({
      success: true,
      message: 'Damage report deleted successfully'
    });
  } catch (error) {
    console.error('Delete damage report error:', error);
    res.status(500).json({ error: 'Failed to delete damage report' });
  }
};

const getDamageTrends = async (req, res) => {
  try {
    const trends = await DamageReport.getDamageTrendsByDate();
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Get damage trends error:', error);
    res.status(500).json({ error: 'Failed to fetch damage trends' });
  }
};

module.exports = {
  createDamageReport,
  getDamageReportsByRental,
  getDamageReport,
  updateDamageReport,
  updateReportStatus,
  getAllDamageReports,
  getPendingReports,
  getDamageStatistics,
  getEnhancedDamageStatistics,
  getDamageTrends,
  deleteDamageReport,
  upload: upload.array('images', 5) // Allow up to 5 images
};
