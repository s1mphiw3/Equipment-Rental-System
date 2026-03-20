const PickupReturn = require('../models/PickupReturn');
const Rental = require('../models/Rental');
const Equipment = require('../models/Equipment');
const Penalty = require('../models/Penalty');
const db = require('../config/database');

const createPickupReturn = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { rental_id } = req.body;

    // Check if rental exists
    const rental = await Rental.findById(rental_id);
    if (!rental) {
      await connection.rollback();
      return res.status(404).json({ error: 'Rental not found' });
    }

    // Check if pickup/return record already exists
    const existingRecord = await PickupReturn.findByRentalId(rental_id);
    if (existingRecord) {
      await connection.rollback();
      return res.status(400).json({ error: 'Pickup/return record already exists for this rental' });
    }

    // Create pickup/return record
    const recordId = await PickupReturn.create({
      rental_id,
      pickup_staff_id: req.user.id // Staff creating the record
    });

    await connection.commit();

    const record = await PickupReturn.findByRentalId(rental_id);

    res.status(201).json({
      success: true,
      message: 'Pickup/return record created successfully',
      data: record
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create pickup/return error:', error);
    res.status(500).json({ error: 'Failed to create pickup/return record' });
  } finally {
    connection.release();
  }
};

const processPickup = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { pickup_staff_id, pickup_datetime, pickup_notes, condition_on_pickup } = req.body;

    // Get pickup/return record
    const record = await PickupReturn.findById(id);
    if (!record) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pickup/return record not found' });
    }

    // Check if already picked up
    if (record.pickup_datetime) {
      await connection.rollback();
      return res.status(400).json({ error: 'Equipment already picked up' });
    }

    // Update pickup information
    await PickupReturn.updatePickup(id, {
      pickup_staff_id,
      pickup_datetime,
      pickup_notes,
      condition_on_pickup
    });

    // Update rental status
    await Rental.updateStatus(record.rental_id, 'picked_up');

    // Update rental pickup_completed flag
    await db.execute(
      'UPDATE rentals SET pickup_completed = TRUE WHERE id = ?',
      [record.rental_id]
    );

    await connection.commit();

    const updatedRecord = await PickupReturn.findById(id);

    res.json({
      success: true,
      message: 'Pickup processed successfully',
      data: updatedRecord
    });
  } catch (error) {
    await connection.rollback();
    console.error('Process pickup error:', error);
    res.status(500).json({ error: 'Failed to process pickup' });
  } finally {
    connection.release();
  }
};

const processReturn = async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { return_staff_id, return_datetime, return_notes, condition_on_return } = req.body;

    // Get pickup/return record
    const record = await PickupReturn.findById(id);
    if (!record) {
      await connection.rollback();
      return res.status(404).json({ error: 'Pickup/return record not found' });
    }

    // Check if not picked up yet
    if (!record.pickup_datetime) {
      await connection.rollback();
      return res.status(400).json({ error: 'Equipment not picked up yet' });
    }

    // Check if already returned
    if (record.return_datetime) {
      await connection.rollback();
      return res.status(400).json({ error: 'Equipment already returned' });
    }

    // Update return information
    await PickupReturn.updateReturn(id, {
      return_staff_id,
      return_datetime,
      return_notes,
      condition_on_return
    });

    // Update rental status
    await Rental.updateStatus(record.rental_id, 'returned');

    // Update rental return_completed flag and final_return_date
    await db.execute(
      'UPDATE rentals SET return_completed = TRUE, final_return_date = ? WHERE id = ?',
      [return_datetime, record.rental_id]
    );

    // Restore equipment availability
    await Equipment.updateAvailability(record.rental_id, 1);

    // Check if return is late and apply penalty if needed
    const rentalEndDate = new Date(record.end_date || (await Rental.findById(record.rental_id)).end_date);
    const returnDate = new Date(return_datetime);

    if (returnDate > rentalEndDate) {
      try {
        await Penalty.applyLateReturnPenalty(record.rental_id);
      } catch (penaltyError) {
        console.error('Failed to create late return penalty:', penaltyError);
        // Don't fail the entire request if penalty creation fails
      }
    }

    await connection.commit();

    const updatedRecord = await PickupReturn.findById(id);

    res.json({
      success: true,
      message: 'Return processed successfully',
      data: updatedRecord
    });
  } catch (error) {
    await connection.rollback();
    console.error('Process return error:', error);
    res.status(500).json({ error: 'Failed to process return' });
  } finally {
    connection.release();
  }
};

const getPickupReturnByRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    const record = await PickupReturn.findByRentalId(rentalId);
    if (!record) {
      return res.status(404).json({ error: 'Pickup/return record not found' });
    }

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Get pickup/return by rental error:', error);
    res.status(500).json({ error: 'Failed to fetch pickup/return record' });
  }
};

const getPendingPickups = async (req, res) => {
  try {
    const records = await PickupReturn.getPendingPickups();

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get pending pickups error:', error);
    res.status(500).json({ error: 'Failed to fetch pending pickups' });
  }
};

const getPendingReturns = async (req, res) => {
  try {
    const records = await PickupReturn.getPendingReturns();

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get pending returns error:', error);
    res.status(500).json({ error: 'Failed to fetch pending returns' });
  }
};

const getOverdueReturns = async (req, res) => {
  try {
    const records = await PickupReturn.getOverdueReturns();

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get overdue returns error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue returns' });
  }
};

const getAllPickupReturns = async (req, res) => {
  try {
    const { status, staff_id } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (staff_id) filters.staff_id = staff_id;

    const records = await PickupReturn.findAll(filters);

    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Get all pickup/returns error:', error);
    res.status(500).json({ error: 'Failed to fetch pickup/return records' });
  }
};

module.exports = {
  createPickupReturn,
  processPickup,
  processReturn,
  getPickupReturnByRental,
  getPendingPickups,
  getPendingReturns,
  getOverdueReturns,
  getAllPickupReturns
};
