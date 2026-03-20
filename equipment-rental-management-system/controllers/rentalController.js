const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const Payment = require('../models/Payment');
const { rentalValidation } = require('../middleware/validation');
const db = require('../config/database');

const createRental = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { error } = rentalValidation(req.body);
    if (error) {
      await connection.rollback();
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details.map(detail => detail.message) 
      });
    }

    const { equipment_id, quantity, start_date, end_date, notes } = req.body;
    const user_id = req.user.id;

    // Check equipment availability considering quantity
    const isAvailable = await Equipment.checkAvailability(equipment_id, start_date, end_date, quantity);
    if (!isAvailable) {
      await connection.rollback();
      return res.status(409).json({
        error: 'Equipment not available for the selected dates and quantity',
        details: 'The requested quantity is not available for one or more dates in your selected range. Please choose different dates, reduce quantity, or select different equipment.'
      });
    }

    // Get equipment details for pricing
    const equipment = await Equipment.findById(equipment_id);
    if (!equipment) {
      await connection.rollback();
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Calculate rental duration and cost
    const start = new Date(start_date);
    const end = new Date(end_date);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const total_amount = durationDays * equipment.daily_rate * quantity;

    // Create rental record
    const rentalId = await Rental.create({
      user_id,
      equipment_id,
      quantity,
      start_date,
      end_date,
      total_amount,
      notes
    });

    await connection.commit();

    const rental = await Rental.findById(rentalId);

    res.status(201).json({
      success: true,
      message: 'Rental booking created successfully',
      data: rental
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create rental error:', error);
    res.status(500).json({ error: 'Failed to create rental booking' });
  } finally {
    connection.release();
  }
};

const getUserRentals = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;
    const rentals = await Rental.findByUserId(userId, parseInt(limit), parseInt(offset));
    const totalCount = await Rental.getUserRentalsCount(userId);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: rentals,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        limit: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch rental history' });
  }
};

const getAllRentals = async (req, res) => {
  try {
    const { status, equipment_id, user_id, page = 1, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (equipment_id) filters.equipment_id = equipment_id;
    if (user_id) filters.user_id = user_id;

    // Check if pagination is requested
    const hasLimit = limit !== undefined && limit !== '';
    const parsedLimit = hasLimit ? parseInt(limit) : null;
    const parsedPage = hasLimit ? parseInt(page) : null;
    const offset = hasLimit ? (parsedPage - 1) * parsedLimit : null;

    let rentals;
    let totalCount = null;

    if (hasLimit) {
      // Get paginated rentals
      rentals = await Rental.findAll(filters, parsedLimit, offset);
      totalCount = await Rental.getAllRentalsCount(filters);
      const totalPages = Math.ceil(totalCount / parsedLimit);

      res.json({
        success: true,
        data: rentals,
        pagination: {
          currentPage: parsedPage,
          totalPages,
          totalCount,
          limit: parsedLimit,
          hasNext: parsedPage < totalPages,
          hasPrev: parsedPage > 1
        }
      });
    } else {
      // Get all rentals without pagination
      rentals = await Rental.findAll(filters, null, null); // Pass null for limit and offset to get all
      totalCount = rentals.length;

      res.json({
        success: true,
        data: rentals
      });
    }
  } catch (error) {
    console.error('Get all rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch rentals' });
  }
};

const getRentalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check if user has permission to view this rental
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get payment information
    const payments = await Payment.findByRentalId(id);

    res.json({
      success: true,
      data: {
        ...rental,
        payments
      }
    });
  } catch (error) {
    console.error('Get rental by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch rental' });
  }
};

const updateRentalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'picked_up', 'returned', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    const updated = await Rental.updateStatus(id, status);
    if (!updated) {
      return res.status(400).json({ error: 'Failed to update rental status' });
    }

    // Update equipment availability if needed
    if (status === 'confirmed' || status === 'picked_up') {
      await Equipment.updateAvailability(rental.equipment_id, -rental.quantity);
    } else if (status === 'returned' || status === 'cancelled') {
      await Equipment.updateAvailability(rental.equipment_id, rental.quantity);
    }

    const updatedRental = await Rental.findById(id);

    res.json({
      success: true,
      message: `Rental status updated to ${status}`,
      data: updatedRental
    });
  } catch (error) {
    console.error('Update rental status error:', error);
    res.status(500).json({ error: 'Failed to update rental status' });
  }
};

const cancelRental = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rental = await Rental.findById(id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check if user has permission to cancel this rental
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if rental can be cancelled
    if (rental.status !== 'pending' && rental.status !== 'confirmed') {
      return res.status(400).json({ error: 'Rental cannot be cancelled at this stage' });
    }

    const updated = await Rental.updateStatus(id, 'cancelled');
    if (!updated) {
      return res.status(400).json({ error: 'Failed to cancel rental' });
    }

    // Restore equipment availability
    await Equipment.updateAvailability(rental.equipment_id, rental.quantity);

    res.json({
      success: true,
      message: 'Rental cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel rental error:', error);
    res.status(500).json({ error: 'Failed to cancel rental' });
  }
};

module.exports = {
  createRental,
  getUserRentals,
  getAllRentals,
  getRentalById,
  updateRentalStatus,
  cancelRental
};