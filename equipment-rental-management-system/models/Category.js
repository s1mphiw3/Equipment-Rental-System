const db = require('../config/database');

class Category {
  static async findAll() {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, description FROM categories ORDER BY name'
      );
      return rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, description FROM categories WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching category by ID:', error);
      throw error;
    }
  }

  static async findByName(name) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, description FROM categories WHERE name = ?',
        [name]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching category by name:', error);
      throw error;
    }
  }
}

module.exports = Category;
