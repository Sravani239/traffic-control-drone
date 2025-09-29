const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get traffic overview statistics
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM drones WHERE status = 'online') as active_drones,
        (SELECT COUNT(*) FROM drones) as total_drones,
        (SELECT COUNT(*) FROM alerts WHERE status = 'active') as active_alerts,
        (SELECT COUNT(*) FROM alerts WHERE type = 'accident' AND status = 'active') as active_accidents,
        (SELECT COALESCE(SUM(total_vehicles), 0) FROM vehicle_counts WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)) as current_vehicles,
        (SELECT COUNT(*) FROM traffic_lights WHERE status = 'active') as active_traffic_lights
    `);

    res.json({
      success: true,
      data: stats[0]
    });

  } catch (error) {
    console.error('Fetch overview stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview statistics'
    });
  }
});

// Get hourly traffic data for charts
router.get('/hourly-traffic', authenticateToken, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const [hourlyData] = await pool.execute(`
      SELECT 
        HOUR(timestamp) as hour,
        AVG(total_vehicles) as avg_vehicles,
        MAX(total_vehicles) as peak_vehicles,
        COUNT(*) as data_points
      FROM vehicle_counts 
      WHERE DATE(timestamp) = ?
      GROUP BY HOUR(timestamp)
      ORDER BY hour
    `, [date]);

    // Fill missing hours with 0
    const completeData = [];
    for (let hour = 0; hour < 24; hour++) {
      const existingData = hourlyData.find(d => d.hour === hour);
      completeData.push({
        hour: hour.toString().padStart(2, '0') + ':00',
        vehicles: existingData ? Math.round(existingData.avg_vehicles) : 0,
        peak: existingData ? existingData.peak_vehicles : 0
      });
    }

    res.json({
      success: true,
      data: completeData
    });

  } catch (error) {
    console.error('Fetch hourly traffic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hourly traffic data'
    });
  }
});

// Get vehicle type distribution
router.get('/vehicle-types', authenticateToken, async (req, res) => {
  try {
    const [vehicleData] = await pool.execute(`
      SELECT 
        SUM(cars) as cars,
        SUM(trucks) as trucks,
        SUM(buses) as buses,
        SUM(bikes) as bikes
      FROM vehicle_counts 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    `);

    const data = vehicleData[0];
    const total = data.cars + data.trucks + data.buses + data.bikes;

    const distribution = [
      { type: 'Cars', count: data.cars, percentage: total > 0 ? ((data.cars / total) * 100).toFixed(1) : 0 },
      { type: 'Trucks', count: data.trucks, percentage: total > 0 ? ((data.trucks / total) * 100).toFixed(1) : 0 },
      { type: 'Buses', count: data.buses, percentage: total > 0 ? ((data.buses / total) * 100).toFixed(1) : 0 },
      { type: 'Bikes', count: data.bikes, percentage: total > 0 ? ((data.bikes / total) * 100).toFixed(1) : 0 }
    ];

    res.json({
      success: true,
      data: {
        distribution,
        total
      }
    });

  } catch (error) {
    console.error('Fetch vehicle types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle type distribution'
    });
  }
});

// Get congestion hotspots
router.get('/congestion-hotspots', authenticateToken, async (req, res) => {
  try {
    const [hotspots] = await pool.execute(`
      SELECT 
        d.location,
        d.latitude,
        d.longitude,
        AVG(vc.total_vehicles) as avg_vehicles,
        MAX(vc.total_vehicles) as peak_vehicles,
        vc.congestion_level,
        COUNT(*) as data_points
      FROM drones d
      JOIN vehicle_counts vc ON d.id = vc.drone_id
      WHERE vc.timestamp >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
      GROUP BY d.id, d.location, d.latitude, d.longitude, vc.congestion_level
      ORDER BY avg_vehicles DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: hotspots
    });

  } catch (error) {
    console.error('Fetch congestion hotspots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch congestion hotspots'
    });
  }
});

// Get incident response times
router.get('/incident-response', authenticateToken, async (req, res) => {
  try {
    const [responseData] = await pool.execute(`
      SELECT 
        type,
        priority,
        AVG(TIMESTAMPDIFF(MINUTE, created_at, resolved_at)) as avg_response_minutes,
        COUNT(*) as total_incidents,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_incidents
      FROM alerts 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY type, priority
      ORDER BY avg_response_minutes DESC
    `);

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Fetch incident response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident response data'
    });
  }
});

// Get daily summary report
router.get('/daily-summary', authenticateToken, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;

    const [summary] = await pool.execute(`
      SELECT 
        DATE(?) as report_date,
        (SELECT COUNT(*) FROM alerts WHERE DATE(created_at) = ? AND type = 'accident') as accidents_today,
        (SELECT COUNT(*) FROM alerts WHERE DATE(created_at) = ? AND status = 'resolved') as incidents_resolved,
        (SELECT AVG(total_vehicles) FROM vehicle_counts WHERE DATE(timestamp) = ?) as avg_traffic_volume,
        (SELECT MAX(total_vehicles) FROM vehicle_counts WHERE DATE(timestamp) = ?) as peak_traffic_volume,
        (SELECT COUNT(DISTINCT drone_id) FROM vehicle_counts WHERE DATE(timestamp) = ?) as active_drones_today
    `, [date, date, date, date, date, date]);

    res.json({
      success: true,
      data: summary[0]
    });

  } catch (error) {
    console.error('Fetch daily summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch daily summary'
    });
  }
});

module.exports = router;