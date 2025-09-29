const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all drones with latest vehicle counts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [drones] = await pool.execute(`
      SELECT 
        d.*,
        COALESCE(vc.cars, 0) as cars,
        COALESCE(vc.trucks, 0) as trucks,
        COALESCE(vc.buses, 0) as buses,
        COALESCE(vc.bikes, 0) as bikes,
        COALESCE(vc.total_vehicles, 0) as total_vehicles,
        COALESCE(vc.congestion_level, 'low') as congestion_level,
        (SELECT COUNT(*) FROM alerts WHERE drone_id = d.id AND status = 'active' AND type = 'accident') as accidents
      FROM drones d
      LEFT JOIN (
        SELECT DISTINCT
          drone_id,
          FIRST_VALUE(cars) OVER (PARTITION BY drone_id ORDER BY timestamp DESC) as cars,
          FIRST_VALUE(trucks) OVER (PARTITION BY drone_id ORDER BY timestamp DESC) as trucks,
          FIRST_VALUE(buses) OVER (PARTITION BY drone_id ORDER BY timestamp DESC) as buses,
          FIRST_VALUE(bikes) OVER (PARTITION BY drone_id ORDER BY timestamp DESC) as bikes,
          FIRST_VALUE(total_vehicles) OVER (PARTITION BY drone_id ORDER BY timestamp DESC) as total_vehicles,
          FIRST_VALUE(congestion_level) OVER (PARTITION BY drone_id ORDER BY timestamp DESC) as congestion_level
        FROM vehicle_counts
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ) vc ON d.id = vc.drone_id
      ORDER BY d.created_at
    `);

    res.json({
      success: true,
      data: drones
    });

  } catch (error) {
    console.error('Fetch drones error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drones'
    });
  }
});

// Get specific drone details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [drones] = await pool.execute(`
      SELECT 
        d.*,
        COALESCE(vc.cars, 0) as cars,
        COALESCE(vc.trucks, 0) as trucks,
        COALESCE(vc.buses, 0) as buses,
        COALESCE(vc.bikes, 0) as bikes,
        COALESCE(vc.total_vehicles, 0) as total_vehicles,
        COALESCE(vc.congestion_level, 'low') as congestion_level
      FROM drones d
      LEFT JOIN (
        SELECT *
        FROM vehicle_counts
        WHERE drone_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
        ORDER BY timestamp DESC
        LIMIT 1
      ) vc ON d.id = vc.drone_id
      WHERE d.id = ?
    `, [id, id]);

    if (drones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    res.json({
      success: true,
      data: drones[0]
    });

  } catch (error) {
    console.error('Fetch drone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drone details'
    });
  }
});

// Update drone status
router.patch('/:id/status', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['online', 'offline', 'maintenance'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: online, offline, or maintenance'
      });
    }

    const [result] = await pool.execute(
      'UPDATE drones SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    res.json({
      success: true,
      message: 'Drone status updated successfully'
    });

  } catch (error) {
    console.error('Update drone status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update drone status'
    });
  }
});

// Get drone vehicle count history
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { hours = 24 } = req.query;

    const [history] = await pool.execute(`
      SELECT 
        cars, trucks, buses, bikes, total_vehicles, 
        congestion_level, timestamp
      FROM vehicle_counts
      WHERE drone_id = ? AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY timestamp DESC
      LIMIT 100
    `, [id, parseInt(hours)]);

    res.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('Fetch drone history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drone history'
    });
  }
});

// Add new vehicle count data (simulated from drone)
router.post('/:id/vehicle-count', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { cars, trucks, buses, bikes, congestion_level } = req.body;

    // Validate input
    if (cars < 0 || trucks < 0 || buses < 0 || bikes < 0) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle counts cannot be negative'
      });
    }

    if (!['low', 'medium', 'high'].includes(congestion_level)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid congestion level'
      });
    }

    // Verify drone exists
    const [drones] = await pool.execute('SELECT id FROM drones WHERE id = ?', [id]);
    if (drones.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Drone not found'
      });
    }

    // Insert vehicle count data
    await pool.execute(`
      INSERT INTO vehicle_counts (drone_id, cars, trucks, buses, bikes, congestion_level)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, cars, trucks, buses, bikes, congestion_level]);

    res.json({
      success: true,
      message: 'Vehicle count data recorded successfully'
    });

  } catch (error) {
    console.error('Add vehicle count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vehicle count data'
    });
  }
});

module.exports = router;