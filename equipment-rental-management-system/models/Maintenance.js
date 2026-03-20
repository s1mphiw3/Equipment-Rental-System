const db = require('../config/database');

class Maintenance {
  static async create(maintenanceData) {
    const {
      equipment_id,
      maintenance_date,
      description,
      cost = null,
      performed_by = null,
      next_maintenance_date = null
    } = maintenanceData;

    const [result] = await db.execute(
      `INSERT INTO maintenance
       (equipment_id, maintenance_date, description, cost, performed_by, next_maintenance_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [equipment_id, maintenance_date, description, cost, performed_by, next_maintenance_date]
    );

    return result.insertId;
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT m.*, e.name as equipment_name, e.image_url
      FROM maintenance m
      LEFT JOIN equipment e ON m.equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.equipment_id) {
      query += ' AND m.equipment_id = ?';
      params.push(filters.equipment_id);
    }

    if (filters.upcoming_only) {
      query += ' AND m.maintenance_date >= CURDATE()';
    }

    if (filters.past_only) {
      query += ' AND m.maintenance_date < CURDATE()';
    }

    if (filters.has_next_maintenance) {
      query += ' AND m.next_maintenance_date IS NOT NULL';
    }

    query += ' ORDER BY m.maintenance_date DESC';

    const [maintenance] = await db.execute(query, params);
    return maintenance;
  }

  static async findById(id) {
    const [maintenance] = await db.execute(
      `SELECT m.*, e.name as equipment_name, e.image_url
       FROM maintenance m
       LEFT JOIN equipment e ON m.equipment_id = e.id
       WHERE m.id = ?`,
      [id]
    );
    return maintenance[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`);
    const values = Object.values(updateData);
    values.push(id);

    const [result] = await db.execute(
      `UPDATE maintenance SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await db.execute(
      'DELETE FROM maintenance WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getUpcomingMaintenance(days = 30) {
    const [maintenance] = await db.execute(
      `SELECT m.*, e.name as equipment_name
       FROM maintenance m
       LEFT JOIN equipment e ON m.equipment_id = e.id
       WHERE m.maintenance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
       ORDER BY m.maintenance_date ASC`,
      [days]
    );
    return maintenance;
  }

  static async getOverdueMaintenance() {
    const [maintenance] = await db.execute(
      `SELECT m.*, e.name as equipment_name
       FROM maintenance m
       LEFT JOIN equipment e ON m.equipment_id = e.id
       WHERE m.maintenance_date < CURDATE()
       ORDER BY m.maintenance_date ASC`
    );
    return maintenance;
  }

  static async getMaintenanceHistory(equipmentId) {
    const [maintenance] = await db.execute(
      `SELECT m.*, e.name as equipment_name
       FROM maintenance m
       LEFT JOIN equipment e ON m.equipment_id = e.id
       WHERE m.equipment_id = ?
       ORDER BY m.maintenance_date DESC`,
      [equipmentId]
    );
    return maintenance;
  }

  static async getMaintenanceCosts(startDate, endDate) {
    const [costs] = await db.execute(
      `SELECT
        SUM(m.cost) as total_cost,
        COUNT(*) as maintenance_count,
        AVG(m.cost) as average_cost,
        MONTH(m.maintenance_date) as month,
        YEAR(m.maintenance_date) as year
       FROM maintenance m
       WHERE m.maintenance_date BETWEEN ? AND ?
       AND m.cost IS NOT NULL
       GROUP BY YEAR(m.maintenance_date), MONTH(m.maintenance_date)
       ORDER BY m.maintenance_date`,
      [startDate, endDate]
    );
    return costs;
  }

  static async getNextMaintenanceDates() {
    const [maintenance] = await db.execute(
      `SELECT m.*, e.name as equipment_name
       FROM maintenance m
       LEFT JOIN equipment e ON m.equipment_id = e.id
       WHERE m.next_maintenance_date IS NOT NULL
       AND m.next_maintenance_date >= CURDATE()
       ORDER BY m.next_maintenance_date ASC`
    );
    return maintenance;
  }
}

module.exports = Maintenance;
