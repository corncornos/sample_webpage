const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth');

// Get all vehicles with search and filter
router.get('/', verifyToken, async (req, res) => {
  const { brand, model, year, status, sortBy, order } = req.query;
  
  try {
    let query = 'SELECT * FROM vehicles WHERE 1=1';
    const params = [];

    if (brand) {
      query += ' AND brand LIKE ?';
      params.push(`%${brand}%`);
    }
    if (model) {
      query += ' AND model LIKE ?';
      params.push(`%${model}%`);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (sortBy === 'price') {
      query += ` ORDER BY selling_price ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortBy === 'date') {
      query += ` ORDER BY created_at ${order === 'desc' ? 'DESC' : 'ASC'}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const connection = await req.pool.getConnection();
    const [vehicles] = await connection.execute(query, params);
    connection.release();

    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get single vehicle
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const connection = await req.pool.getConnection();
    const [vehicles] = await connection.execute(
      'SELECT * FROM vehicles WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json(vehicles[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Add vehicle
router.post('/', verifyToken, checkRole(['admin', 'staff']), async (req, res) => {
  const {
    stock_number, brand, model, year, variant, color, transmission,
    fuel_type, mileage, purchase_price, selling_price, notes
  } = req.body;

  if (!stock_number || !brand || !model || !year) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  try {
    const connection = await req.pool.getConnection();
    const [result] = await connection.execute(
      `INSERT INTO vehicles 
       (stock_number, brand, model, year, variant, color, transmission, 
        fuel_type, mileage, purchase_price, selling_price, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [stock_number, brand, model, year, variant, color, transmission,
       fuel_type, mileage, purchase_price, selling_price, 'Available', notes]
    );
    connection.release();

    res.status(201).json({ 
      message: 'Vehicle added successfully', 
      id: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Update vehicle
router.put('/:id', verifyToken, checkRole(['admin', 'staff']), async (req, res) => {
  const {
    stock_number, brand, model, year, variant, color, transmission,
    fuel_type, mileage, purchase_price, selling_price, status, notes
  } = req.body;

  try {
    const connection = await req.pool.getConnection();
    await connection.execute(
      `UPDATE vehicles SET 
       stock_number=?, brand=?, model=?, year=?, variant=?, color=?, 
       transmission=?, fuel_type=?, mileage=?, purchase_price=?, 
       selling_price=?, status=?, notes=?
       WHERE id=?`,
      [stock_number, brand, model, year, variant, color, transmission,
       fuel_type, mileage, purchase_price, selling_price, status, notes, req.params.id]
    );
    connection.release();

    res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete vehicle
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const connection = await req.pool.getConnection();
    await connection.execute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    connection.release();

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

module.exports = router;
