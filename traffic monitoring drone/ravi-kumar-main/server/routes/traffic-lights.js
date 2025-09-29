const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all traffic lights
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [lights] = await pool.execute(`
      SELECT * FROM traffic_lights 
      ORDER BY created_at
    `);

    res.json({
      success: true,
      data: lights
    });

  } catch (error) {
    console.error('Fetch traffic lights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic lights'
    });
  }
});

// Get specific traffic light
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [lights] = await pool.execute(
      'SELECT * FROM traffic_lights WHERE id = ?',
      [id]
    );

    if (lights.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Traffic light not found'
      });
    }

    res.json({
      success: true,
      data: lights[0]
    });

  } catch (error) {
    console.error('Fetch traffic light error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic light'
    });
  }
});

// Update traffic light mode
router.patch('/:id/mode', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { mode } = req.body;

    if (!['manual', 'auto', 'smart'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mode. Must be: manual, auto, or smart'
      });
    }

    const [result] = await pool.execute(
      'UPDATE traffic_lights SET mode = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [mode, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Traffic light not found'
      });
    }

    res.json({
      success: true,
      message: 'Traffic light mode updated successfully'
    });

  } catch (error) {
    console.error('Update traffic light mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update traffic light mode'
    });
  }
});

// Update traffic light phase (manual control)
router.patch('/:id/phase', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;
    const { phase, time_remaining } = req.body;

    if (!['red', 'yellow', 'green'].includes(phase)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phase. Must be: red, yellow, or green'
      });
    }

    // Check if traffic light is in manual mode
    const [lights] = await pool.execute(
      'SELECT mode FROM traffic_lights WHERE id = ?',
      [id]
    );

    if (lights.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Traffic light not found'
      });
    }

    if (lights[0].mode !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'Traffic light must be in manual mode to change phase'
      });
    }

    const [result] = await pool.execute(
      'UPDATE traffic_lights SET current_phase = ?, time_remaining = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [phase, time_remaining || 30, id]
    );

    res.json({
      success: true,
      message: 'Traffic light phase updated successfully'
    });

  } catch (error) {
    console.error('Update traffic light phase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update traffic light phase'
    });
  }
});

// Get traffic light statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_lights,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_lights,
        SUM(CASE WHEN mode = 'smart' THEN 1 ELSE 0 END) as smart_lights,
        SUM(CASE WHEN mode = 'auto' THEN 1 ELSE 0 END) as auto_lights,
        SUM(CASE WHEN mode = 'manual' THEN 1 ELSE 0 END) as manual_lights,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_lights
      FROM traffic_lights
    `);

    res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Fetch traffic light stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traffic light statistics'
    });
  }
});

module.exports = router;