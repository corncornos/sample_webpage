const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function resetPasswords() {
  try {
    // Hash the demo passwords
    const adminHash = await bcrypt.hash('admin123', 10);
    const staffHash = await bcrypt.hash('staff123', 10);

    console.log('Admin Hash:', adminHash);
    console.log('Staff Hash:', staffHash);

    // Connect to database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'car_inventory_db'
    });

    // Clear existing users
    await connection.execute('DELETE FROM users');

    // Insert new users with correct hashes
    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@cardealer.com', adminHash, 'admin']
    );

    await connection.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Staff Member', 'staff@cardealer.com', staffHash, 'staff']
    );

    console.log('✅ Passwords reset successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPasswords();
