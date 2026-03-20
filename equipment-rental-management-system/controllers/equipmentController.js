const Equipment = require('../models/Equipment');
const Rental = require('../models/Rental')
const Category = require('../models/Category');
const { equipmentValidation } = require('../middleware/validation');

const getAllEquipment = async (req, res) => {
  try {
    const { category, search, available, page = 1, limit = 12, startDate, endDate, minPrice, maxPrice } = req.query;

    const filters = {};
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (available) filters.available = available;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (minPrice) filters.minPrice = parseFloat(minPrice);
    if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

    const pagination = {
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const { equipment, totalItems } = await Equipment.findAll(filters, pagination);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: equipment,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        totalItems,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    console.error('Get equipment by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate } = req.body;
    
    if (!equipmentId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Equipment ID, start date, and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const isAvailable = await Equipment.checkAvailability(equipmentId, start, end);
    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Calculate rental cost
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalCost = durationDays * equipment.daily_rate;

    res.json({
      success: true,
      available: isAvailable,
      equipment: {
        id: equipment.id,
        name: equipment.name,
        daily_rate: equipment.daily_rate
      },
      rentalDetails: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        durationDays,
        totalCost
      }
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { error } = equipmentValidation(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    const equipmentData = {
      ...req.body,
      image_url,
      is_active: true // Ensure new equipment is active
    };

    const equipmentId = await Equipment.create(equipmentData);

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      equipmentId
    });
  } catch (error) {
    console.error('Create equipment error:', error);
    if (error.message.includes('Category')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create equipment' });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Handle image upload
    let image_url = equipment.image_url; // Keep existing image if no new one uploaded
    if (req.file) {
      image_url = `/uploads/products/${req.file.filename}`;
    }

    const updateData = {
      ...req.body,
      image_url
    };

    const updated = await Equipment.update(id, updateData);

    if (!updated) {
      return res.status(400).json({ error: 'Failed to update equipment' });
    }

    const updatedEquipment = await Equipment.findById(id);

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: updatedEquipment
    });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Failed to update equipment' });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Soft delete by setting is_active to false
    await Equipment.update(id, { is_active: false });

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Failed to delete equipment' });
  }
};

const getDaysUntilAvailable = async (req, res) => {
  try {
    const { id } = req.params;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    const days = await Rental.getDaysUntilAvailable(id);
console.log(days)
    res.json({
      success: true,
      daysUntilAvailable: days
    });
  } catch (error) {
    console.error('Get days until available error:', error);
    res.status(500).json({ error: 'Failed to get availability information' });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  checkAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getDaysUntilAvailable,
  getCategories
};
