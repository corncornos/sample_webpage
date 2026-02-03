const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all sales
router.get('/', verifyToken, async (req, res) => {
  try {
    const connection = await req.pool.getConnection();
    const [sales] = await connection.execute(`
      SELECT s.*, v.brand, v.model, v.year, v.stock_number 
      FROM sales s 
      JOIN vehicles v ON s.vehicle_id = v.id 
      ORDER BY s.sale_date DESC
    `);
    connection.release();

    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Create sale (mark vehicle as sold)
router.post('/', verifyToken, checkRole(['admin', 'staff']), async (req, res) => {
  const { vehicle_id, buyer_name, sale_price, payment_method } = req.body;

  if (!vehicle_id || !buyer_name || !sale_price) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const connection = await req.pool.getConnection();

    // Begin transaction
    await connection.beginTransaction();

    // Insert sale
    await connection.execute(
      `INSERT INTO sales (vehicle_id, buyer_name, sale_price, payment_method, sale_date)
       VALUES (?, ?, ?, ?, NOW())`,
      [vehicle_id, buyer_name, sale_price, payment_method || 'Cash']
    );

    // Update vehicle status to Sold
    await connection.execute(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      ['Sold', vehicle_id]
    );

    await connection.commit();
    connection.release();

    res.status(201).json({ message: 'Sale recorded successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Update sale
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  const { buyer_name, sale_price, payment_method, sale_date } = req.body;

  try {
    const connection = await req.pool.getConnection();
    await connection.execute(
      `UPDATE sales SET 
       buyer_name=?, sale_price=?, payment_method=?, sale_date=?
       WHERE id=?`,
      [buyer_name, sale_price, payment_method, sale_date, req.params.id]
    );
    connection.release();

    res.json({ message: 'Sale updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update sale' });
  }
});

// Delete sale
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const connection = await req.pool.getConnection();

    // Get vehicle_id before deleting
    const [sales] = await connection.execute(
      'SELECT vehicle_id FROM sales WHERE id = ?',
      [req.params.id]
    );

    if (sales.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Sale not found' });
    }

    await connection.beginTransaction();

    // Delete sale
    await connection.execute('DELETE FROM sales WHERE id = ?', [req.params.id]);

    // Update vehicle status back to Available
    await connection.execute(
      'UPDATE vehicles SET status = ? WHERE id = ?',
      ['Available', sales[0].vehicle_id]
    );

    await connection.commit();
    connection.release();

    res.json({ message: 'Sale deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

module.exports = router;
