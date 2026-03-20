const db = require('../config/database');

class Rental {
  static async create(rentalData) {
    const { user_id, equipment_id, quantity, start_date, end_date, total_amount, notes } = rentalData;

    const [result] = await db.execute(
      `INSERT INTO rentals (user_id, equipment_id, quantity, start_date, end_date, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, equipment_id, quantity, start_date, end_date, total_amount, notes]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [rentals] = await db.execute(
      `SELECT r.*, e.name as equipment_name, e.image_url, e.daily_rate, e.description, e.condition, r.quantity as quantity, e.available_quantity,
              c.name as category_name,
              u.first_name, u.last_name, u.email, u.phone, u.address, u.role
       FROM rentals r
       JOIN equipment e ON r.equipment_id = e.id
       LEFT JOIN categories c ON e.category_id = c.id
       JOIN users u ON r.user_id = u.id
       WHERE r.id = ?`,
      [id]
    );
    return rentals[0];
  }

  static async findByUserId(userId, limit = null, offset = 0) {
    let query = `
      SELECT r.*, e.name as equipment_name, e.image_url,
             c.name as category_name
      FROM rentals r
      JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    const params = [userId];

    if (limit !== null) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [rentals] = await db.execute(query, params);
    return rentals;
  }

  static async getUserRentalsCount(userId) {
    const [result] = await db.execute(
      'SELECT COUNT(*) as count FROM rentals WHERE user_id = ?',
      [userId]
    );
    return result[0].count;
  }

  static async getAllRentalsCount(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM rentals r WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }

    if (filters.equipment_id) {
      query += ' AND r.equipment_id = ?';
      params.push(filters.equipment_id);
    }

    if (filters.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    const [result] = await db.execute(query, params);
    return result[0].count;
  }

  static async findAll(filters = {}, limit = null, offset = 0) {
    let query = `
      SELECT r.*, e.name as equipment_name, e.image_url,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name,
             u.email as customer_email
      FROM rentals r
      JOIN equipment e ON r.equipment_id = e.id
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND r.status = ?';
      params.push(filters.status);
    }

    if (filters.equipment_id) {
      query += ' AND r.equipment_id = ?';
      params.push(filters.equipment_id);
    }

    if (filters.user_id) {
      query += ' AND r.user_id = ?';
      params.push(filters.user_id);
    }

    query += ' ORDER BY r.created_at DESC';

    if (limit !== null) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const [rentals] = await db.execute(query, params);
    return rentals;
  }

  static async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE rentals SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async getOverlappingRentals(equipmentId, startDate, endDate, excludeRentalId = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM rentals
      WHERE equipment_id = ?
      AND status IN ('confirmed', 'picked_up')
      AND ((start_date BETWEEN ? AND ?)
        OR (end_date BETWEEN ? AND ?)
        OR (start_date <= ? AND end_date >= ?))
    `;
    const params = [equipmentId, startDate, endDate, startDate, endDate, startDate, endDate];

    if (excludeRentalId) {
      query += ' AND id != ?';
      params.push(excludeRentalId);
    }

    const [result] = await db.execute(query, params);
    return result[0].count;
  }

  static async getDaysUntilAvailable(equipmentId) {
    const query = `
      SELECT MIN(end_date) as earliest_end_date
      FROM rentals
      WHERE equipment_id = ?
      AND status IN ('confirmed', 'picked_up')
    `;
    const [result] = await db.execute(query, [equipmentId]);

    if (!result[0].earliest_end_date) {
      return 0; // No active rentals, equipment is available
    }

    const earliestEndDate = new Date(result[0].earliest_end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const diffTime = earliestEndDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays); // Ensure non-negative
  }

  // Analytics methods for dashboard
  static async getMostRentedEquipment(limit = 10) {
    const query = `
      SELECT
        e.name as equipment_name,
        e.id as equipment_id,
        COUNT(r.id) as rental_count,
        SUM(r.total_amount) as total_revenue
      FROM rentals r
      JOIN equipment e ON r.equipment_id = e.id
      WHERE r.status IN ('confirmed', 'picked_up', 'returned')
      GROUP BY e.id, e.name
      ORDER BY rental_count DESC
      LIMIT ?
    `;
    const [result] = await db.execute(query, [limit]);
    return result;
  }

static async getMonthlyRentalTrends(year = null) {
  if (!year) {
    year = new Date().getFullYear();
  }

  const query = `
    SELECT
      MONTH(created_at) as month,
      COUNT(*) as rental_count,
      COALESCE(SUM(total_amount), 0) as monthly_revenue
    FROM rentals
    WHERE YEAR(created_at) = ?
    AND status IN ('pending', 'confirmed', 'picked_up', 'returned')
    GROUP BY MONTH(created_at)
    ORDER BY month
  `;
  const [result] = await db.execute(query, [year]);
  return result;
}

  static async getCustomerBookingFrequency() {
    const query = `
      SELECT
        user_id,
        COUNT(*) as booking_count,
        SUM(total_amount) as total_spent,
        MAX(created_at) as last_booking
      FROM rentals
      WHERE status IN ('confirmed', 'picked_up', 'returned')
      GROUP BY user_id
      ORDER BY booking_count DESC
    `;
    const [result] = await db.execute(query);
    return result;
  }

  static async getEquipmentUtilizationRates() {
    const query = `
      SELECT
        e.id,
        e.name,
        e.quantity,
        e.available_quantity,
        COUNT(r.id) as total_rentals,
        AVG(DATEDIFF(r.end_date, r.start_date)) as avg_rental_duration
      FROM equipment e
      LEFT JOIN rentals r ON e.id = r.equipment_id
        AND r.status IN ('confirmed', 'picked_up', 'returned')
      WHERE e.is_active = TRUE
      GROUP BY e.id, e.name, e.quantity, e.available_quantity
      ORDER BY total_rentals DESC
    `;
    const [result] = await db.execute(query);
    return result;
  }

  static async getTopCategoriesByRentals(limit = 5) {
    const query = `
      SELECT
        c.name as category_name,
        c.id as category_id,
        COUNT(r.id) as rental_count
      FROM rentals r
      JOIN equipment e ON r.equipment_id = e.id
      JOIN categories c ON e.category_id = c.id
      WHERE r.status IN ('confirmed', 'picked_up', 'returned')
      GROUP BY c.id, c.name
      ORDER BY rental_count DESC
      LIMIT ?
    `;
    const [result] = await db.execute(query, [limit]);
    return result;
  }
}

module.exports = Rental;
