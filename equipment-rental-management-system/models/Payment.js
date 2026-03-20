const db = require('../config/database');

class Payment {
  static async create(paymentData) {
    const { rental_id, amount, payment_method, stripe_payment_intent_id } = paymentData;
    
    const [result] = await db.execute(
      `INSERT INTO payments (rental_id, amount, payment_method, stripe_payment_intent_id) 
       VALUES (?, ?, ?, ?)`,
      [rental_id, amount, payment_method, stripe_payment_intent_id]
    );
    
    return result.insertId;
  }

  static async findByRentalId(rentalId) {
    const [payments] = await db.execute(
      'SELECT * FROM payments WHERE rental_id = ? ORDER BY created_at DESC',
      [rentalId]
    );
    return payments[0];
  }

  static async updateStatus(paymentId, status) {
    const [result] = await db.execute(
      'UPDATE payments SET payment_status = ? WHERE id = ?',
      [status, paymentId]
    );
    return result.affectedRows > 0;
  }

  static async findByStripePaymentIntent(stripePaymentIntentId) {
    const [payments] = await db.execute(
      'SELECT * FROM payments WHERE stripe_payment_intent_id = ?',
      [stripePaymentIntentId]
    );
    return payments[0];
  }
}

module.exports = Payment;