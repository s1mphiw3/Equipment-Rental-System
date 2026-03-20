const Penalty = require('../models/Penalty');
const Rental = require('../models/Rental');
const db = require('../config/database');

const createPenalty = async (req, res) => {
  try {
    const { rental_id, penalty_type, amount, reason } = req.body;

    // Check permissions - only staff can create penalties
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if rental exists
    const rental = await Rental.findById(rental_id);
    if (!rental) {
      return res.status(404).json({ error: 'Rental not found' });
    }

    const penaltyId = await Penalty.create({
      rental_id,
      penalty_type,
      amount: parseFloat(amount),
      reason
    });

    // Update rental to mark it has penalties
    await db.execute(
      'UPDATE rentals SET has_penalties = TRUE WHERE id = ?',
      [rental_id]
    );

    const penalty = await Penalty.findById(penaltyId);

    res.status(201).json({
      success: true,
      message: 'Penalty created successfully',
      data: penalty
    });
  } catch (error) {
    console.error('Create penalty error:', error);
    res.status(500).json({ error: 'Failed to create penalty' });
  }
};

const getPenaltiesByRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const penalties = await Penalty.findByRentalId(rentalId);

    res.json({
      success: true,
      data: penalties
    });
  } catch (error) {
    console.error('Get penalties by rental error:', error);
    res.status(500).json({ error: 'Failed to fetch penalties' });
  }
};

const getPenalty = async (req, res) => {
  try {
    const { id } = req.params;

    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return res.status(404).json({ error: 'Penalty not found' });
    }

    // Check permissions
    const rental = await Rental.findById(penalty.rental_id);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: penalty
    });
  } catch (error) {
    console.error('Get penalty error:', error);
    res.status(500).json({ error: 'Failed to fetch penalty' });
  }
};

const payPenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return res.status(404).json({ error: 'Penalty not found' });
    }

    if (penalty.paid_at) {
      return res.status(400).json({ error: 'Penalty already paid' });
    }

    // Check permissions - customer can pay their own penalties, staff can pay any
    const rental = await Rental.findById(penalty.rental_id);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await Penalty.updatePayment(id, payment_method);

    const updatedPenalty = await Penalty.findById(id);

    res.json({
      success: true,
      message: 'Penalty payment recorded successfully',
      data: updatedPenalty
    });
  } catch (error) {
    console.error('Pay penalty error:', error);
    res.status(500).json({ error: 'Failed to process penalty payment' });
  }
};

const simulatePayPenalty = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const penalty = await Penalty.findById(id);
    if (!penalty) {
      return res.status(404).json({ error: 'Penalty not found' });
    }

    if (penalty.paid_at) {
      return res.status(400).json({ error: 'Penalty already paid' });
    }

    // Check permissions - customer can simulate paying their own penalties, staff can simulate any
    const rental = await Rental.findById(penalty.rental_id);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update database with simulated payment
    await Penalty.updatePayment(id, payment_method || 'simulated_payment');

    const updatedPenalty = await Penalty.findById(id);

    res.json({
      success: true,
      message: 'Penalty payment simulated successfully (database updated)',
      data: updatedPenalty,
      simulation: true
    });
  } catch (error) {
    console.error('Simulate pay penalty error:', error);
    res.status(500).json({ error: 'Failed to simulate penalty payment' });
  }
};

const calculateLateReturnPenalty = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Check permissions - only staff can calculate penalties
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const penaltyData = await Penalty.calculateLateReturnPenalty(rentalId);

    if (!penaltyData) {
      return res.json({
        success: true,
        message: 'No late return penalty needed',
        data: null
      });
    }

    res.json({
      success: true,
      message: 'Late return penalty calculated',
      data: penaltyData
    });
  } catch (error) {
    console.error('Calculate late return penalty error:', error);
    res.status(500).json({ error: 'Failed to calculate penalty' });
  }
};

const applyLateReturnPenalty = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Check permissions - only staff can apply penalties
    if (req.user.role === 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const penaltyId = await Penalty.applyLateReturnPenalty(rentalId);

    if (!penaltyId) {
      return res.json({
        success: true,
        message: 'No penalty applied (either not overdue or already has penalty)',
        data: null
      });
    }

    const penalty = await Penalty.findById(penaltyId);

    res.json({
      success: true,
      message: 'Late return penalty applied successfully',
      data: penalty
    });
  } catch (error) {
    console.error('Apply late return penalty error:', error);
    res.status(500).json({ error: 'Failed to apply penalty' });
  }
};

const getAllPenalties = async (req, res) => {
  try {
    const { penalty_type, paid, rental_id } = req.query;
    const filters = {};

    if (penalty_type) filters.penalty_type = penalty_type;
    if (paid !== undefined) filters.paid = paid === 'true';
    if (rental_id) filters.rental_id = rental_id;

    const penalties = await Penalty.findAll(filters);

    res.json({
      success: true,
      data: penalties
    });
  } catch (error) {
    console.error('Get all penalties error:', error);
    res.status(500).json({ error: 'Failed to fetch penalties' });
  }
};

const getUnpaidPenaltiesByRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Check permissions
    const rental = await Rental.findById(rentalId);
    if (req.user.role === 'customer' && rental.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const penalties = await Penalty.getUnpaidPenaltiesByRental(rentalId);
    const totalUnpaid = await Penalty.getTotalUnpaidPenalties(rentalId);

    res.json({
      success: true,
      data: {
        penalties,
        total_unpaid: totalUnpaid
      }
    });
  } catch (error) {
    console.error('Get unpaid penalties error:', error);
    res.status(500).json({ error: 'Failed to fetch unpaid penalties' });
  }
};

const getPenaltySummary = async (req, res) => {
  try {
    const summary = await Penalty.getPenaltySummary();

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get penalty summary error:', error);
    res.status(500).json({ error: 'Failed to fetch penalty summary' });
  }
};

const getOverdueRentals = async (req, res) => {
  try {
    const rentals = await Penalty.getOverdueRentals();

    res.json({
      success: true,
      data: rentals
    });
  } catch (error) {
    console.error('Get overdue rentals error:', error);
    res.status(500).json({ error: 'Failed to fetch overdue rentals' });
  }
};

module.exports = {
  createPenalty,
  getPenaltiesByRental,
  getPenalty,
  payPenalty,
  simulatePayPenalty,
  calculateLateReturnPenalty,
  applyLateReturnPenalty,
  getAllPenalties,
  getUnpaidPenaltiesByRental,
  getPenaltySummary,
  getOverdueRentals
};
