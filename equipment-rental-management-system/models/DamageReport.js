const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class DamageReport {
  static async create(damageData) {
    const {
      rental_id,
      reported_by,
      damage_description,
      severity_level,
      estimated_cost,
      actual_cost,
      image_urls
    } = damageData;

    const [result] = await db.execute(
      `INSERT INTO damage_reports (rental_id, reported_by, damage_description, severity_level, estimated_cost, actual_cost, image_urls)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [rental_id, reported_by, damage_description, severity_level, estimated_cost, actual_cost, JSON.stringify(image_urls || [])]
    );

    return result.insertId;
  }

  static async findById(id) {
    const [reports] = await db.execute(
      `SELECT dr.*,
              r.equipment_id, r.start_date, r.end_date,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name,
              CONCAT(rb.first_name, ' ', rb.last_name) as reported_by_name,
              e.name as equipment_name
       FROM damage_reports dr
       JOIN rentals r ON dr.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       JOIN users rb ON dr.reported_by = rb.id
       JOIN equipment e ON r.equipment_id = e.id
       WHERE dr.id = ?`,
      [id]
    );
    if (reports[0]) {
      reports[0].image_urls = reports[0].image_urls ? JSON.parse(reports[0].image_urls) : [];
    }
    return reports[0];
  }

  static async findByRentalId(rentalId) {
    const [reports] = await db.execute(
      `SELECT dr.*,
              CONCAT(rb.first_name, ' ', rb.last_name) as reported_by_name
       FROM damage_reports dr
       JOIN users rb ON dr.reported_by = rb.id
       WHERE dr.rental_id = ?
       ORDER BY dr.created_at DESC`,
      [rentalId]
    );
    return reports.map(report => ({
      ...report,
      image_urls: report.image_urls ? JSON.parse(report.image_urls) : []
    }));
  }

  static async findAll(filters = {}, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;

    let query = `
      SELECT dr.*,
             r.equipment_id, r.start_date, r.end_date,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name,
             CONCAT(rb.first_name, ' ', rb.last_name) as reported_by_name,
              e.name as equipment_name
      FROM damage_reports dr
      JOIN rentals r ON dr.rental_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN users rb ON dr.reported_by = rb.id
      JOIN equipment e ON r.equipment_id = e.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND dr.status = ?';
      params.push(filters.status);
    }

    if (filters.severity_level) {
      query += ' AND dr.severity_level = ?';
      params.push(filters.severity_level);
    }

    if (filters.reported_by) {
      query += ' AND dr.reported_by = ?';
      params.push(filters.reported_by);
    }

    query += ' ORDER BY dr.created_at DESC';

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as total FROM (${query}) as subquery`;
    const [countResult] = await db.execute(countQuery, params);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Add pagination to main query
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [reports] = await db.execute(query, params);

    return {
      data: reports.map(report => ({
        ...report,
        image_urls: report.image_urls ? JSON.parse(report.image_urls) : []
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  static async updateStatus(id, status, repairNotes = null, actualCost = null) {
    let query = 'UPDATE damage_reports SET status = ?';
    const params = [status];

    if (repairNotes !== null) {
      query += ', repair_notes = ?';
      params.push(repairNotes);
    }

    if (actualCost !== null) {
      query += ', actual_cost = ?';
      params.push(actualCost);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.execute(query, params);
    return result.affectedRows > 0;
  }

  static async update(id, updateData) {
    const {
      damage_description,
      severity_level,
      estimated_cost,
      image_urls,
      status,
      repair_notes,
      actual_cost
    } = updateData;

    const [result] = await db.execute(
      `UPDATE damage_reports
       SET damage_description = ?, severity_level = ?, estimated_cost = ?,
           image_urls = ?, status = ?, repair_notes = ?, actual_cost = ?
       WHERE id = ?`,
      [
        damage_description,
        severity_level,
        estimated_cost,
        JSON.stringify(image_urls || []),
        status,
        repair_notes,
        actual_cost,
        id
      ]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // Get report details first to delete associated images
    const [reports] = await db.execute(
      'SELECT image_urls FROM damage_reports WHERE id = ?',
      [id]
    );

    if (reports.length > 0 && reports[0].image_urls) {
      try {
        const imageUrls = JSON.parse(reports[0].image_urls);
        // Delete image files from filesystem
        for (const imageUrl of imageUrls) {
          const imagePath = path.join(__dirname, '..', imageUrl);
          await fs.unlink(imagePath);
        }
      } catch (error) {
        console.warn('Failed to delete image files:', error.message);
      }
    }

    const [result] = await db.execute(
      'DELETE FROM damage_reports WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  static async getPendingReports() {
    const [reports] = await db.execute(
      `SELECT dr.*,
              e.name as equipment_name,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name
       FROM damage_reports dr
       JOIN rentals r ON dr.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       JOIN equipment e ON r.equipment_id = e.id
       WHERE dr.status = 'pending'
       ORDER BY dr.created_at DESC`
    );
    return reports;
  }

  static async getReportsBySeverity() {
    const [reports] = await db.execute(
      `SELECT severity_level, COUNT(*) as count
       FROM damage_reports
       GROUP BY severity_level
       ORDER BY FIELD(severity_level, 'minor', 'moderate', 'severe', 'critical')`
    );
    return reports;
  }

  static async getTotalDamageCost() {
    const [result] = await db.execute(
      `SELECT
        SUM(estimated_cost) as total_estimated,
        SUM(actual_cost) as total_actual
       FROM damage_reports
       WHERE status IN ('approved', 'repaired')`
    );
    return result[0];
  }
  static async getRepairedReports() {
    const [reports] = await db.execute(
      `SELECT dr.*,
              e.name as equipment_name,
              CONCAT(u.first_name, ' ', u.last_name) as customer_name
       FROM damage_reports dr
       JOIN rentals r ON dr.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       JOIN equipment e ON r.equipment_id = e.id
       WHERE dr.status = 'repaired'
       ORDER BY dr.created_at DESC`
    );
    return reports;
  }
  /**
   * Get damage report counts grouped by day for the last 30 days, sorted ascending by date.
   * Returns array of objects: { date: 'YYYY-MM-DD', count: number }
   */
  static async getDamageTrendsByDate() {
    const [rows] = await db.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count
       FROM damage_reports
       WHERE created_at >= CURDATE() - INTERVAL 30 DAY
       GROUP BY DATE(created_at)
       ORDER BY DATE(created_at) ASC`
    );
    return rows;
  }
}

module.exports = DamageReport;
