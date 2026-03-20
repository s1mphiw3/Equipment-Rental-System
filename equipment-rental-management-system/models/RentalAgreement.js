const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

class RentalAgreement {
  static async create(agreementData) {
    const { rental_id, agreement_text, pdf_path } = agreementData;

    const [result] = await db.execute(
      `INSERT INTO rental_agreements (rental_id, agreement_text, pdf_path)
       VALUES (?, ?, ?)`,
      [rental_id, agreement_text, pdf_path]
    );

    return result.insertId;
  }

  static async findByRentalId(rentalId) {
    const [agreements] = await db.execute(
      `SELECT ra.*, r.equipment_id, r.start_date, r.end_date, r.total_amount,
              u.first_name, u.last_name, u.email, u.phone
       FROM rental_agreements ra
       JOIN rentals r ON ra.rental_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE ra.rental_id = ?
       ORDER BY ra.generated_at DESC
       LIMIT 1`,
      [rentalId]
    );
    return agreements[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT ra.*, r.equipment_id, r.start_date, r.end_date, r.total_amount,
             CONCAT(u.first_name, ' ', u.last_name) as customer_name, u.email as customer_email
      FROM rental_agreements ra
      JOIN rentals r ON ra.rental_id = r.id
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.rental_id) {
      query += ' AND ra.rental_id = ?';
      params.push(filters.rental_id);
    }

    if (filters.signed !== undefined) {
      if (filters.signed) {
        query += ' AND ra.signed_at IS NOT NULL';
      } else {
        query += ' AND ra.signed_at IS NULL';
      }
    }

    query += ' ORDER BY ra.generated_at DESC';

    const [agreements] = await db.execute(query, params);
    return agreements;
  }

  static async updateSignature(id, signedAt = new Date()) {
    const [result] = await db.execute(
      'UPDATE rental_agreements SET signed_at = ? WHERE id = ?',
      [signedAt, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    // Get agreement details first to delete PDF file
    const [agreements] = await db.execute(
      'SELECT pdf_path FROM rental_agreements WHERE id = ?',
      [id]
    );

    if (agreements.length > 0 && agreements[0].pdf_path) {
      try {
        // Delete PDF file from filesystem
        const pdfPath = path.join(__dirname, '..', agreements[0].pdf_path);
        await fs.unlink(pdfPath);
      } catch (error) {
        console.warn('Failed to delete PDF file:', error.message);
      }
    }

    const [result] = await db.execute(
      'DELETE FROM rental_agreements WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  // Generate agreement text template
  static generateAgreementText(rentalData) {
    const {
      equipment_name,
      start_date,
      end_date,
      total_amount,
      customer_name,
      customer_email,
      daily_rate
    } = rentalData;

    const startDate = new Date(start_date).toLocaleDateString();
    const endDate = new Date(end_date).toLocaleDateString();
    const duration = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24));

    return `
EQUIPMENT RENTAL AGREEMENT

This Equipment Rental Agreement (the "Agreement") is made and entered into as of ${new Date().toLocaleDateString()}, by and between:

Equipment Rental Company ("Company")
and
${customer_name} ("Customer")
Email: ${customer_email}

EQUIPMENT DETAILS:
Equipment: ${equipment_name}
Rental Period: ${startDate} to ${endDate} (${duration} days)
Daily Rate: $${daily_rate}
Total Amount: $${total_amount}

TERMS AND CONDITIONS:

1. RENTAL PERIOD: The equipment shall be rented for the period specified above.

2. PAYMENT: Customer agrees to pay the total amount specified above upon pickup.

3. RESPONSIBILITY: Customer assumes full responsibility for the equipment during the rental period.

4. RETURN CONDITION: Equipment must be returned in the same condition as received, normal wear and tear excepted.

5. LATE RETURNS: Late returns will incur additional charges at the daily rate plus a late fee.

6. DAMAGE: Any damage to the equipment beyond normal wear and tear will be charged to the customer.

7. INSURANCE: Customer is responsible for obtaining appropriate insurance coverage.

8. GOVERNING LAW: This agreement shall be governed by the laws of the jurisdiction.

CUSTOMER ACKNOWLEDGMENT:

I, ${customer_name}, acknowledge that I have read and understood this agreement and agree to its terms.

Customer Signature: ___________________________ Date: __________

Company Representative: _______________________ Date: __________

Generated on: ${new Date().toLocaleString()}
    `.trim();
  }
}

module.exports = RentalAgreement;
