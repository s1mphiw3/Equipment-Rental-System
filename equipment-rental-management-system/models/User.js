const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, first_name, last_name, phone, address, role = 'customer' } = userData;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const verificationToken = require('crypto').randomBytes(32).toString('hex');

    const [result] = await db.execute(
      `INSERT INTO users (email, password, first_name, last_name, phone, address, role, email_verification_token, email_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, first_name, last_name, phone, address, role, verificationToken, false]
    );

    return { userId: result.insertId, verificationToken };
  }

  static async findByEmail(email) {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );
    return users[0];
  }

  static async findById(id) {
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name, phone, address, role, two_factor_secret, two_factor_enabled, email_verified, created_at FROM users WHERE id = ? AND is_active = TRUE',
      [id]
    );
    return users[0];
  }

  static async findByIdWithPassword(id) {
    const [users] = await db.execute(
      'SELECT id, email, password, first_name, last_name, phone, address, role, two_factor_secret, two_factor_enabled, email_verified, created_at FROM users WHERE id = ? AND is_active = TRUE',
      [id]
    );
    return users[0];
  }

  static async findByVerificationToken(token) {
    const [users] = await db.execute(
      'SELECT * FROM users WHERE email_verification_token = ? AND is_active = TRUE',
      [token]
    );
    return users[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateProfile(userId, updateData) {
    const { first_name, last_name, phone, address } = updateData;
    const [result] = await db.execute(
      `UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?
       WHERE id = ?`,
      [first_name, last_name, phone, address, userId]
    );
    return result.affectedRows > 0;
  }

  static async update2FA(userId, secret, enabled) {
    const [result] = await db.execute(
      `UPDATE users SET two_factor_secret = ?, two_factor_enabled = ? WHERE id = ?`,
      [secret, enabled, userId]
    );
    return result.affectedRows > 0;
  }

  static async updatePassword(userId, newPassword) {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    const [result] = await db.execute(
      `UPDATE users SET password = ? WHERE id = ?`,
      [hashedPassword, userId]
    );
    return result.affectedRows > 0;
  }

  static async verifyEmail(token) {
    const [result] = await db.execute(
      `UPDATE users SET email_verified = TRUE, email_verification_token = NULL
       WHERE email_verification_token = ? AND email_verified = FALSE`,
      [token]
    );
    return result.affectedRows > 0;
  }

  static async updateVerificationToken(userId, token) {
    const [result] = await db.execute(
      `UPDATE users SET email_verification_token = ? WHERE id = ?`,
      [token, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;
