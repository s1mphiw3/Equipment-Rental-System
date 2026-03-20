const db = require('../config/database');

class Penalty {
  static async create(penaltyData) {
    const {
      rental_id,
      penalty_type,
      amount,
      reason
    } = penaltyData;

    const [result] = await db.execute(
      `INSERT INTO penalties (rental_id, penalty_type, amount, reason)
       VALUES (?, ?, ?, ?)`,
      [rental_id, penalty_type, amount, reason]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [penalties] = await db.execute(
      `SELECT p.*,
              r.equipment_id, r.start_date, r.end_date,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name
       FROM penalties p
       JOIN rentals r ON p.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    return penalties[0];
  }

  static async findByRentalId(rentalId) {
    const [penalties] = await db.execute(
      `SELECT p.* FROM penalties p
       WHERE p.rental_id = ?
       ORDER BY p.applied_at DESC`,
      [rentalId]
    );
    return penalties;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT p.*,
             r.equipment_name, r.start_date, r.end_date,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email
      FROM penalties p
      JOIN rentals r ON p.rental_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.penalty_type) {
      query += ' AND p.penalty_type = ?';
      params.push(filters.penalty_type);
    }

    if (filters.paid !== undefined) {
      if (filters.paid) {
        query += ' AND p.paid_at IS NOT NULL';
      } else {
        query += ' AND p.paid_at IS NULL';
      }
    }

    if (filters.rental_id) {
      query += ' AND p.rental_id = ?';
      params.push(filters.rental_id);
    }

    query += ' ORDER BY p.applied_at DESC';

    const [penalties] = await db.execute(query, params);
    return penalties;
  }

  static async updatePayment(id, paymentMethod, paidAt = new Date()) {
    const [result] = await db.execute(
      'UPDATE penalties SET paid_at = ?, payment_method = ? WHERE id = ?',
      [paidAt, paymentMethod, id]
    );
    return result.affectedRows > 0;
  }

  static async calculateLateReturnPenalty(rentalId) {
    // Get rental details
    const [rentals] = await db.execute(
      `SELECT r.*, e.daily_rate
       FROM rentals r
       JOIN equipment e ON r.equipment_id = e.id
       WHERE r.id = ?`,
      [rentalId]
    );

    if (rentals.length === 0) {
      throw new Error('Rental not found');
    }

    const rental = rentals[0];
    const endDate = new Date(rental.end_date);
    const today = new Date();

    // Calculate overdue days
    const overdueDays = Math.max(0, Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)));

    if (overdueDays === 0) {
      return null; // Not overdue
    }

    // Calculate penalty: daily rate + 50% late fee
    const dailyPenalty = rental.daily_rate * 1.5;
    const totalPenalty = dailyPenalty * overdueDays;

    return {
      rental_id: rentalId,
      penalty_type: 'late_return',
      amount: totalPenalty,
      reason: `Late return penalty: ${overdueDays} days overdue at $${dailyPenalty.toFixed(2)} per day`,
      overdue_days: overdueDays
    };
  }

  static async applyLateReturnPenalty(rentalId) {
    const penaltyData = await this.calculateLateReturnPenalty(rentalId);

    if (!penaltyData) {
      return null; // Not overdue
    }

    // Check if penalty already exists for this rental
    const existingPenalties = await this.findByRentalId(rentalId);
    const hasLateReturnPenalty = existingPenalties.some(p =>
      p.penalty_type === 'late_return' && p.paid_at === null
    );

    if (hasLateReturnPenalty) {
      return null; // Already has unpaid late return penalty
    }

    const penaltyId = await this.create(penaltyData);

    // Update rental overdue_days
    await db.execute(
      'UPDATE rentals SET overdue_days = ?, has_penalties = TRUE WHERE id = ?',
      [penaltyData.overdue_days, rentalId]
    );

    return penaltyId;
  }

  static async getUnpaidPenaltiesByRental(rentalId) {
    const [penalties] = await db.execute(
      `SELECT * FROM penalties
       WHERE rental_id = ? AND paid_at IS NULL
       ORDER BY applied_at DESC`,
      [rentalId]
    );
    return penalties;
  }

  static async getTotalUnpaidPenalties(rentalId) {
    const [result] = await db.execute(
      `SELECT SUM(amount) as total_unpaid
       FROM penalties
       WHERE rental_id = ? AND paid_at IS NULL`,
      [rentalId]
    );
    return result[0].total_unpaid || 0;
  }

  static async getPenaltySummary() {
    const [result] = await db.execute(
      `SELECT
        penalty_type,
        COUNT(*) as count,
        SUM(amount) as total_amount,
        SUM(CASE WHEN paid_at IS NOT NULL THEN amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN paid_at IS NULL THEN amount ELSE 0 END) as unpaid_amount
       FROM penalties
       GROUP BY penalty_type
       ORDER BY total_amount DESC`
    );
    return result;
  }

  static async getOverdueRentals() {
    const [rentals] = await db.execute(
      `SELECT r.*,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name,
              DATEDIFF(CURDATE(), r.end_date) as days_overdue
       FROM rentals r
       JOIN users u ON r.user_id = u.id
       WHERE r.end_date < CURDATE()
       AND r.status = 'picked_up'
       AND r.return_completed = FALSE
       ORDER BY r.end_date ASC`
    );
    return rentals;
  }

  static async applyDamagePenalty(rentalId, actualCost, reason = null) {
    // Check if damage penalty already exists for this rental
    const existingPenalties = await this.findByRentalId(rentalId);
    const hasDamagePenalty = existingPenalties.some(p =>
      p.penalty_type === 'damage' && p.paid_at === null
    );

    if (hasDamagePenalty) {
      return null; // Already has unpaid damage penalty
    }

    const penaltyId = await this.create({
      rental_id: rentalId,
      penalty_type: 'damage',
      amount: actualCost,
      reason: reason || `Damage penalty: $${actualCost.toFixed(2)}`
    });

    // Update rental to mark it has penalties
    await db.execute(
      'UPDATE rentals SET has_penalties = TRUE WHERE id = ?',
      [rentalId]
    );

    return penaltyId;
  }
}

module.exports = Penalty;
