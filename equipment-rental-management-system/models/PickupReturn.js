const db = require('../config/database');
const Equipment = require('./Equipment');

class PickupReturn {
  static async create(pickupReturnData) {
    const {
      rental_id,
      pickup_staff_id,
      pickup_datetime = null,
      pickup_notes = null,
      condition_on_pickup = null
    } = pickupReturnData;

    const [result] = await db.execute(
      `INSERT INTO pickup_returns (rental_id, pickup_staff_id, pickup_datetime, pickup_notes, condition_on_pickup)
       VALUES (?, ?, ?, ?, ?)`,
      [rental_id, pickup_staff_id, pickup_datetime, pickup_notes, condition_on_pickup]
    );

    return result.insertId;
  }

  static async findByRentalId(rentalId) {
    const [pickupReturns] = await db.execute(
      `SELECT pr.*,
              pu.first_name as pickup_staff_first_name, pu.last_name as pickup_staff_last_name,
              ru.first_name as return_staff_first_name, ru.last_name as return_staff_last_name
       FROM pickup_returns pr
       LEFT JOIN users pu ON pr.pickup_staff_id = pu.id
       LEFT JOIN users ru ON pr.return_staff_id = ru.id
       WHERE pr.rental_id = ?`,
      [rentalId]
    );
    return pickupReturns[0];
  }

  static async findById(id) {
    const [pickupReturns] = await db.execute(
      `SELECT pr.*,
              pu.first_name as pickup_staff_first_name, pu.last_name as pickup_staff_last_name,
              ru.first_name as return_staff_first_name, ru.last_name as return_staff_last_name
       FROM pickup_returns pr
       LEFT JOIN users pu ON pr.pickup_staff_id = pu.id
       LEFT JOIN users ru ON pr.return_staff_id = ru.id
       WHERE pr.id = ?`,
      [id]
    );
    return pickupReturns[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT pr.*,
             r.equipment_name, r.start_date, r.end_date,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name,
             pu.first_name as pickup_staff_first_name, pu.last_name as pickup_staff_last_name,
             ru.first_name as return_staff_first_name, ru.last_name as return_staff_last_name
      FROM pickup_returns pr
      JOIN rentals r ON pr.rental_id = r.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN users pu ON pr.pickup_staff_id = pu.id
      LEFT JOIN users ru ON pr.return_staff_id = ru.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      if (filters.status === 'pending_pickup') {
        query += ' AND pr.pickup_datetime IS NULL';
      } else if (filters.status === 'picked_up') {
        query += ' AND pr.pickup_datetime IS NOT NULL AND pr.return_datetime IS NULL';
      } else if (filters.status === 'returned') {
        query += ' AND pr.return_datetime IS NOT NULL';
      }
    }

    if (filters.staff_id) {
      query += ' AND (pr.pickup_staff_id = ? OR pr.return_staff_id = ?)';
      params.push(filters.staff_id, filters.staff_id);
    }

    query += ' ORDER BY pr.created_at DESC';

    const [pickupReturns] = await db.execute(query, params);
    return pickupReturns;
  }

  static async updatePickup(id, pickupData) {
    const { pickup_staff_id, pickup_datetime, pickup_notes, condition_on_pickup } = pickupData;

    // Get rental details to update equipment availability
    const [rentalData] = await db.execute(
      'SELECT r.equipment_id, r.quantity FROM rentals r JOIN pickup_returns pr ON r.id = pr.rental_id WHERE pr.id = ?',
      [id]
    );

    if (rentalData.length > 0) {
      const { equipment_id, quantity } = rentalData[0];
      // Decrease available quantity when equipment is picked up
      await Equipment.updateAvailability(equipment_id, -quantity);
    }

    const [result] = await db.execute(
      `UPDATE pickup_returns
       SET pickup_staff_id = ?, pickup_datetime = ?, pickup_notes = ?, condition_on_pickup = ?
       WHERE id = ?`,
      [pickup_staff_id, pickup_datetime, pickup_notes, condition_on_pickup, id]
    );
    return result.affectedRows > 0;
  }

  static async updateReturn(id, returnData) {
    const { return_staff_id, return_datetime, return_notes, condition_on_return } = returnData;

    // Get rental details to update equipment availability
    const [rentalData] = await db.execute(
      'SELECT r.equipment_id, r.quantity FROM rentals r JOIN pickup_returns pr ON r.id = pr.rental_id WHERE pr.id = ?',
      [id]
    );

    if (rentalData.length > 0) {
      const { equipment_id, quantity } = rentalData[0];
      // Increase available quantity when equipment is returned
      await Equipment.updateAvailability(equipment_id, quantity);
    }

    const [result] = await db.execute(
      `UPDATE pickup_returns
       SET return_staff_id = ?, return_datetime = ?, return_notes = ?, condition_on_return = ?
       WHERE id = ?`,
      [return_staff_id, return_datetime, return_notes, condition_on_return, id]
    );
    return result.affectedRows > 0;
  }

  static async getPendingPickups() {
    const [pickupReturns] = await db.execute(
      `SELECT pr.*,
              r.equipment_name, r.start_date, r.end_date,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email
       FROM pickup_returns pr
       JOIN rentals r ON pr.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE pr.pickup_datetime IS NULL
       AND r.status = 'confirmed'
       ORDER BY r.start_date ASC`
    );
    return pickupReturns;
  }

  static async getPendingReturns() {
    const [pickupReturns] = await db.execute(
      `SELECT pr.*,
              r.equipment_name, r.start_date, r.end_date,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email
       FROM pickup_returns pr
       JOIN rentals r ON pr.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE pr.return_datetime IS NULL
       AND pr.pickup_datetime IS NOT NULL
       AND r.status = 'picked_up'
       ORDER BY r.end_date ASC`
    );
    return pickupReturns;
  }

  static async getOverdueReturns() {
    const [pickupReturns] = await db.execute(
      `SELECT pr.*,
              r.equipment_name, r.start_date, r.end_date,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email,
              DATEDIFF(CURDATE(), r.end_date) as days_overdue
       FROM pickup_returns pr
       JOIN rentals r ON pr.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE pr.return_datetime IS NULL
       AND pr.pickup_datetime IS NOT NULL
       AND r.end_date < CURDATE()
       AND r.status = 'picked_up'
       ORDER BY r.end_date ASC`
    );
    return pickupReturns;
  }
}

module.exports = PickupReturn;
