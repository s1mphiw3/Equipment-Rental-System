const mysql = require('mysql2/promise');

async function addQuantityColumn() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'equipment_rental_management_system'
  });

  try {
    await connection.execute('ALTER TABLE rentals ADD COLUMN quantity INT NOT NULL DEFAULT 1 AFTER equipment_id');
    console.log('Added quantity column to rentals table');
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    await connection.end();
  }
}

addQuantityColumn().catch(console.error);
