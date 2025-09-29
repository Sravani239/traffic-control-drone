const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get all alerts with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status = 'active', 
      type, 
      priority, 
      page = 1, 
      limit = 50 
    } = req.query;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [alerts] = await pool.execute(`
      SELECT 
        a.*,
        u1.name as created_by_name,
        u2.name as resolved_by_name,
        d.name as drone_name
      FROM alerts a
      LEFT JOIN users u1 ON a.created_by = u1.id
      LEFT JOIN users u2 ON a.resolved_by = u2.id
      LEFT JOIN drones d ON a.drone_id = d.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN a.priority = 'critical' THEN 1
          WHEN a.priority = 'high' THEN 2
          WHEN a.priority = 'medium' THEN 3
          WHEN a.priority = 'low' THEN 4
        END,
        a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Get total count for pagination
    const [countResult] = await pool.execute(`
      SELECT COUNT(*) as total FROM alerts a ${whereClause}
    `, params);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult[0].total,
          pages: Math.ceil(countResult[0].total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Fetch alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Create new alert
router.post('/', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const {
      type,
      priority = 'medium',
      title,
      message,
      location,
      latitude,
      longitude,
      drone_id
    } = req.body;

    // Validate required fields
    if (!type || !title || !message || !location) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, message, and location are required'
      });
    }

    // Validate enums
    if (!['accident', 'congestion', 'maintenance', 'emergency'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert type'
      });
    }

    if (!['low', 'medium', 'high', 'critical'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority level'
      });
    }

    // Verify drone exists if provided
    if (drone_id) {
      const [drones] = await pool.execute('SELECT id FROM drones WHERE id = ?', [drone_id]);
      if (drones.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid drone ID'
        });
      }
    }

    const [result] = await pool.execute(`
      INSERT INTO alerts (type, priority, title, message, location, latitude, longitude, drone_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [type, priority, title, message, location, latitude, longitude, drone_id, req.user.id]);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert'
    });
  }
});

// Resolve alert
router.patch('/:id/resolve', authenticateToken, requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(`
      UPDATE alerts 
      SET status = 'resolved', resolved_by = ?, resolved_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'active'
    `, [req.user.id, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found or already resolved'
      });
    }

    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });

  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert'
    });
  }
});

// Get alert statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_alerts,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_alerts,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_alerts,
        SUM(CASE WHEN type = 'accident' AND status = 'active' THEN 1 ELSE 0 END) as active_accidents,
        SUM(CASE WHEN type = 'congestion' AND status = 'active' THEN 1 ELSE 0 END) as active_congestion,
        SUM(CASE WHEN priority = 'critical' AND status = 'active' THEN 1 ELSE 0 END) as critical_alerts,
        AVG(CASE 
          WHEN status = 'resolved' AND resolved_at IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, created_at, resolved_at) 
          ELSE NULL 
        END) as avg_resolution_time_minutes
      FROM alerts
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Fetch alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alert statistics'
    });
  }
});

module.exports = router;