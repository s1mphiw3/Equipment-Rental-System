const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'equipment_rental_management_system'
  });

  // Create tables for equipment rental system
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      role ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
      is_active BOOLEAN DEFAULT TRUE,
      email_verified BOOLEAN DEFAULT FALSE,
      email_verification_token VARCHAR(255),
      two_factor_secret VARCHAR(255),
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS equipment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      category_id INT,
      daily_rate DECIMAL(10,2) NOT NULL,
      total_quantity INT NOT NULL,
      available_quantity INT NOT NULL,
      image_url VARCHAR(255),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`,

    `CREATE TABLE IF NOT EXISTS rentals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      equipment_id INT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_amount DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'confirmed', 'picked_up', 'returned', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (equipment_id) REFERENCES equipment(id)
    )`,

    `CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rental_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      payment_method ENUM('credit_card', 'debit_card', 'cash', 'bank_transfer') DEFAULT 'credit_card',
      payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
      stripe_payment_intent_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rental_id) REFERENCES rentals(id)
    )`,

    `CREATE TABLE IF NOT EXISTS maintenance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      equipment_id INT NOT NULL,
      maintenance_date DATE NOT NULL,
      description TEXT NOT NULL,
      cost DECIMAL(10,2),
      performed_by VARCHAR(255),
      next_maintenance_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (equipment_id) REFERENCES equipment(id)
    )`
  ];

  for (const table of tables) {
    await connection.execute(table);
    console.log('Created table');
  }

  // Alter existing tables to add missing columns
  const alterStatements = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255)`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE`
  ];

  for (const alter of alterStatements) {
    try {
      await connection.execute(alter);
      console.log('Altered table');
    } catch (error) {
      console.log('Error altering table:', error.message);
    }
  }

  // Insert sample data
  const sampleData = [
    `INSERT IGNORE INTO users (first_name, last_name, email, password, phone, role) VALUES
    ('John', 'Admin', 'admin@example.com', '$2b$10$hash', '1234567890', 'admin'),
    ('Jane', 'Staff', 'staff@example.com', '$2b$10$hash', '1234567891', 'staff'),
    ('Bob', 'Customer', 'customer@example.com', '$2b$10$hash', '1234567892', 'customer')`,

    `INSERT IGNORE INTO categories (name, description) VALUES
    ('Construction Tools', 'Heavy machinery and construction equipment'),
    ('Power Tools', 'Electric and battery-powered tools'),
    ('Gardening Equipment', 'Lawn and garden maintenance tools')`,

    `INSERT IGNORE INTO equipment (name, description, category_id, daily_rate, total_quantity, available_quantity) VALUES
    ('Excavator', 'Heavy duty excavator for digging', 1, 500.00, 2, 2),
    ('Drill Machine', 'Professional power drill', 2, 25.00, 5, 5),
    ('Lawn Mower', 'Gas-powered lawn mower', 3, 30.00, 3, 3),
    ('Concrete Mixer', 'Electric concrete mixer', 1, 75.00, 4, 4),
    ('Chainsaw', 'Professional chainsaw', 2, 40.00, 3, 3)`,

    `INSERT IGNORE INTO rentals (user_id, equipment_id, start_date, end_date, total_amount, status) VALUES
    (3, 1, '2024-01-01', '2024-01-05', 2500.00, 'returned'),
    (3, 2, '2024-01-10', '2024-01-12', 50.00, 'returned'),
    (3, 3, '2024-02-01', '2024-02-03', 60.00, 'returned'),
    (3, 1, '2024-02-15', '2024-02-20', 2500.00, 'returned'),
    (3, 4, '2024-03-01', '2024-03-02', 75.00, 'returned'),
    (3, 2, '2024-03-10', '2024-03-15', 125.00, 'returned'),
    (3, 5, '2024-04-01', '2024-04-03', 80.00, 'returned'),
    (3, 1, '2024-04-10', '2024-04-12', 1000.00, 'returned'),
    (3, 3, '2024-05-01', '2024-05-05', 120.00, 'returned'),
    (3, 4, '2024-05-10', '2024-05-12', 150.00, 'returned')`,

    `INSERT IGNORE INTO payments (rental_id, amount, payment_method, payment_status, stripe_payment_intent_id) VALUES
    (1, 2500.00, 'credit_card', 'completed', 'pi_mock_1704067200000'),
    (2, 50.00, 'credit_card', 'completed', 'pi_mock_1704844800000'),
    (3, 60.00, 'credit_card', 'completed', 'pi_mock_1706745600000'),
    (4, 2500.00, 'credit_card', 'completed', 'pi_mock_1707955200000'),
    (5, 75.00, 'credit_card', 'completed', 'pi_mock_1709251200000'),
    (6, 125.00, 'credit_card', 'completed', 'pi_mock_1709875200000'),
    (7, 80.00, 'credit_card', 'completed', 'pi_mock_1711929600000'),
    (8, 1000.00, 'credit_card', 'completed', 'pi_mock_1712707200000'),
    (9, 120.00, 'credit_card', 'completed', 'pi_mock_1714521600000'),
    (10, 150.00, 'credit_card', 'completed', 'pi_mock_1715472000000')`
  ];

  // Insert sample data for new tables
  const newTablesData = [
    // Rental Agreements
    `INSERT IGNORE INTO rental_agreements (rental_id, agreement_text, pdf_path, signed_at) VALUES
    (1, 'Equipment rental agreement for Excavator from 2024-01-01 to 2024-01-05', 'uploads/agreements/agreement_1_1704067200000.pdf', '2024-01-01 10:00:00'),
    (2, 'Equipment rental agreement for Drill Machine from 2024-01-10 to 2024-01-12', 'uploads/agreements/agreement_2_1704844800000.pdf', '2024-01-10 14:30:00'),
    (3, 'Equipment rental agreement for Lawn Mower from 2024-02-01 to 2024-02-03', 'uploads/agreements/agreement_3_1706745600000.pdf', '2024-02-01 09:15:00'),
    (4, 'Equipment rental agreement for Excavator from 2024-02-15 to 2024-02-20', 'uploads/agreements/agreement_4_1707955200000.pdf', '2024-02-15 16:45:00'),
    (5, 'Equipment rental agreement for Concrete Mixer from 2024-03-01 to 2024-03-02', 'uploads/agreements/agreement_5_1709251200000.pdf', '2024-03-01 11:20:00')`,

    // Pickup Returns
    `INSERT IGNORE INTO pickup_returns (rental_id, pickup_staff_id, return_staff_id, pickup_datetime, return_datetime, pickup_notes, return_notes, condition_on_pickup, condition_on_return) VALUES
    (1, 2, 2, '2024-01-01 10:00:00', '2024-01-05 17:00:00', 'Equipment picked up in excellent condition', 'Returned in good condition, minor usage marks', 'excellent', 'good'),
    (2, 2, 2, '2024-01-10 14:30:00', '2024-01-12 16:00:00', 'Drill machine inspected and cleaned', 'Returned with normal wear', 'good', 'good'),
    (3, 2, 2, '2024-02-01 09:15:00', '2024-02-03 18:30:00', 'Lawn mower fueled and ready', 'Returned with grass clippings cleaned', 'excellent', 'good'),
    (4, 2, 2, '2024-02-15 16:45:00', '2024-02-20 15:30:00', 'Excavator maintenance check completed', 'Heavy usage but no damage', 'good', 'fair'),
    (5, 2, 2, '2024-03-01 11:20:00', '2024-03-02 14:00:00', 'Concrete mixer inspected for safety', 'Returned with concrete residue cleaned', 'good', 'good')`,

    // Damage Reports
    `INSERT IGNORE INTO damage_reports (rental_id, reported_by, damage_description, severity_level, estimated_cost, status, repair_notes, actual_cost) VALUES
    (1, 3, 'Minor scratches on excavator bucket', 'minor', 150.00, 'repaired', 'Polished and repainted scratches', 120.00),
    (4, 3, 'Heavy wear on excavator tracks', 'moderate', 800.00, 'approved', 'Track replacement scheduled', 750.00),
    (2, 3, 'Drill bit broken during use', 'minor', 25.00, 'repaired', 'Replaced drill bit', 20.00),
    (3, 3, 'Lawn mower blade dull', 'minor', 50.00, 'pending', 'Blade sharpening required', 0.00),
    (5, 3, 'Concrete mixer motor bearing noise', 'moderate', 200.00, 'under_review', 'Bearing inspection needed', 0.00)`,

    // Penalties
    `INSERT IGNORE INTO penalties (rental_id, penalty_type, amount, reason, paid_at, payment_method) VALUES
    (1, 'late_return', 100.00, 'Equipment returned 2 hours late', '2024-01-05 18:00:00', 'cash'),
    (4, 'damage', 750.00, 'Track wear and tear beyond normal use', '2024-02-21 10:00:00', 'card'),
    (2, 'other', 25.00, 'Lost drill accessories', '2024-01-12 17:00:00', 'cash'),
    (3, 'late_return', 30.00, 'Returned 1 day late', '2024-02-04 09:00:00', 'card'),
    (5, 'damage', 150.00, 'Motor bearing replacement', NULL, NULL)`
  ];

  for (const data of sampleData) {
    try {
      await connection.execute(data);
      console.log('Inserted sample data');
    } catch (error) {
      console.log('Error inserting data:', error.message);
    }
  }

  // Insert data for new tables
  for (const data of newTablesData) {
    try {
      await connection.execute(data);
      console.log('Inserted new table sample data');
    } catch (error) {
      console.log('Error inserting new table data:', error.message);
    }
  }

  await connection.end();
  console.log('Seeding completed');
}

seed().catch(console.error);
