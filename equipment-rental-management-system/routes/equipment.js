const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  getAllEquipment,
  getEquipmentById,
  checkAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getDaysUntilAvailable,
  getCategories
} = require('../controllers/equipmentController');
const { authenticateToken, requireRole, optionalAuth } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'equipment-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
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


// Public routes
router.get('/', optionalAuth, getAllEquipment);
router.get('/categories', optionalAuth, getCategories);
router.get('/:id', optionalAuth, getEquipmentById);
router.get('/:id/days-until-available', optionalAuth, getDaysUntilAvailable);
router.post('/check-availability', optionalAuth, checkAvailability);

// Admin only routes - FIXED: Added the missing routes
router.post('/', authenticateToken, requireRole(['admin', 'staff']), upload.single('image'), createEquipment);
router.put('/:id', authenticateToken, requireRole(['admin', 'staff']), upload.single('image'), updateEquipment);
router.delete('/:id', authenticateToken, requireRole('admin'), deleteEquipment);

module.exports = router;