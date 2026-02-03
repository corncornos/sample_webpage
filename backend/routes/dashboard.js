const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const connection = await req.pool.getConnection();

    // Total cars
    const [totalCars] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');

    // Available cars
    const [availableCars] = await connection.execute(
      "SELECT COUNT(*) as count FROM vehicles WHERE status = 'Available'"
    );

    // Sold cars
    const [soldCars] = await connection.execute(
      "SELECT COUNT(*) as count FROM vehicles WHERE status = 'Sold'"
    );

    // Total inventory value
    const [inventoryValue] = await connection.execute(
      'SELECT SUM(selling_price) as total FROM vehicles WHERE status = "Available"'
    );

    // Total sales
    const [totalSales] = await connection.execute(
      'SELECT SUM(sale_price) as total FROM sales'
    );

    // Recent sales (last 5)
    const [recentSales] = await connection.execute(`
      SELECT s.*, v.brand, v.model, v.stock_number 
      FROM sales s 
      JOIN vehicles v ON s.vehicle_id = v.id 
      ORDER BY s.sale_date DESC 
      LIMIT 5
    `);

    connection.release();

    res.json({
      totalCars: totalCars[0].count,
      availableCars: availableCars[0].count,
      soldCars: soldCars[0].count,
      inventoryValue: inventoryValue[0].total || 0,
      totalSales: totalSales[0].total || 0,
      recentSales
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
