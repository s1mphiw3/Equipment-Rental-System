const db = require('../config/database');
const Rental = require('./Rental');

class Equipment {
  static async create(equipmentData) {
    if (equipmentData.category) {
      const [categoryResult] = await db.execute(
        'SELECT id FROM categories WHERE name = ?',
        [equipmentData.category]
      );

      console.log('Category Result:', categoryResult);

      if (categoryResult.length === 0) {
        throw new Error(`Category '${equipmentData.category}' not found`);
      }

      // Set the category_id from the category result
      equipmentData.category_id = categoryResult[0].id;
      delete equipmentData.category; // Remove category name from equipmentData
    }

    console.log('Creating equipment with data:', equipmentData);

    // Build dynamic fields and values for INSERT
    const fields = Object.keys(equipmentData).map(key => {
      // Escape reserved keywords
      const escapedKey = ['condition'].includes(key) ? `\`${key}\`` : key;
      return escapedKey;
    });

    const values = Object.values(equipmentData);

    if (fields.length === 0) return false;

    // For CREATE/INSERT operations
    const query = `INSERT INTO equipment (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`;

    console.log('Final Query:', query);
    console.log('Final Values:', values);

    const [result] = await db.execute(query, values);
    return result.insertId; // Return the inserted ID instead of affectedRows
  }

  static async findAll(filters = {}, pagination = {}) {
    let query = `
      SELECT e.*, c.name as category_name
      FROM equipment e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.is_active = TRUE
    `;
    const params = [];

    if (filters.category) {
      query += ' AND e.category_id = ?';
      params.push(filters.category);
    }

    if (filters.search) {
      query += ' AND (e.name LIKE ? OR e.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.available === 'true') {
      query += ' AND e.available_quantity > 0 AND e.under_maintenance = FALSE';
    }

    // Exclude maintenance items
    if (filters.excludeMaintenance !== false) {
      query += ' AND e.under_maintenance = FALSE';
    }

    // Price range filtering
    if (filters.minPrice !== undefined) {
      query += ' AND e.daily_rate >= ?';
      params.push(filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query += ' AND e.daily_rate <= ?';
      params.push(filters.maxPrice);
    }

    // Date range availability filtering
    if (filters.startDate && filters.endDate) {
      query += ` AND e.id NOT IN (
        SELECT DISTINCT r.equipment_id
        FROM rentals r
        WHERE r.status IN ('confirmed', 'picked_up')
        AND (
          (r.start_date BETWEEN ? AND ?)
          OR (r.end_date BETWEEN ? AND ?)
          OR (r.start_date <= ? AND r.end_date >= ?)
        )
      )`;
      params.push(filters.startDate, filters.endDate, filters.startDate, filters.endDate, filters.startDate, filters.endDate);
    }

    query += ' ORDER BY e.name';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as count_query`;
    const [countResult] = await db.execute(countQuery, params);
    const totalItems = countResult[0].total;

    // Add pagination
    if (pagination.limit && pagination.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);
    }

    const [equipment] = await db.execute(query, params);
    return { equipment, totalItems };
  }

  static async findById(id) {
    const [equipment] = await db.execute(
      `SELECT e.*, c.name as category_name
       FROM equipment e
       LEFT JOIN categories c ON e.category_id = c.id
       WHERE e.id = ? AND e.is_active = TRUE`,
      [id]
    );
    return equipment[0];
  }

  static async update(id, updateData) {


    if (updateData.category) {
      const [categoryResult] = await db.execute(
        'SELECT id FROM categories WHERE name = ?',
        [updateData.category]
      );

      console.log('Category Result:', categoryResult);

      if (categoryResult.length === 0) {
        throw new Error(`Category '${updateData.category}' not found`);
      }

      // Set the category_id from the category result
      updateData.category_id = categoryResult[0].id;
      delete updateData.category; // Remove category name from updateData
    }

  const fields = Object.keys(updateData).map(key => {
    // Escape reserved keywords
    const escapedKey = ['condition'].includes(key) ? `\`${key}\`` : key;
    return `${escapedKey} = ?`;
  });

  const values = Object.values(updateData);


    if (fields.length === 0) return false;

    // Add the ID for WHERE clause
    values.push(id);

    // FIX: Use dynamic field construction instead of hardcoded fields
    const query = `UPDATE equipment SET ${fields.join(', ')} WHERE id = ?`;

    console.log('Final Query:', query);
    console.log('Final Values:', values);

    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
}

  static async updateAvailability(equipmentId, change) {
    const [result] = await db.execute(
      'UPDATE equipment SET available_quantity = available_quantity + ? WHERE id = ?',
      [change, equipmentId]
    );
    return result.affectedRows > 0;
  }

  static async setMaintenanceStatus(equipmentId, underMaintenance) {
    const [result] = await db.execute(
      'UPDATE equipment SET under_maintenance = ? WHERE id = ?',
      [underMaintenance, equipmentId]
    );
    return result.affectedRows > 0;
  }

  static async checkAvailability(equipmentId, startDate, endDate, requestedQuantity = 1) {
    // First check if equipment is under maintenance
    const [equipment] = await db.execute(
      'SELECT available_quantity, under_maintenance FROM equipment WHERE id = ?',
      [equipmentId]
    );

    if (equipment.length === 0 || equipment[0].under_maintenance) {
      return false;
    }

    const overlappingCount = await Rental.getOverlappingRentals(equipmentId, startDate, endDate);
    const availableQuantity = equipment[0].available_quantity - overlappingCount;
    return availableQuantity >= requestedQuantity;
  }
}

module.exports = Equipment;
