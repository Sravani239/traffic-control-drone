const { pool } = require('../config/database');

class RealTimeService {
  constructor(io) {
    this.io = io;
    this.intervals = new Map();
    this.connectedUsers = new Map();
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.id}`);

      // Handle user authentication
      socket.on('authenticate', (data) => {
        this.connectedUsers.set(socket.id, {
          userId: data.userId,
          role: data.role,
          connectedAt: new Date()
        });
        
        socket.join('authenticated');
        console.log(`User ${data.userId} authenticated`);
      });

      // Start real-time updates for authenticated users
      socket.on('start-updates', () => {
        this.startUpdatesForUser(socket);
      });

      // Stop real-time updates
      socket.on('stop-updates', () => {
        this.stopUpdatesForUser(socket);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        this.connectedUsers.delete(socket.id);
        this.stopUpdatesForUser(socket);
      });
    });

    // Start global updates
    this.startGlobalUpdates();
  }

  startUpdatesForUser(socket) {
    if (this.intervals.has(socket.id)) {
      return; // Already started
    }

    // Send initial data
    this.sendDroneUpdates(socket);
    this.sendAlertUpdates(socket);
    this.sendTrafficLightUpdates(socket);

    // Set up periodic updates
    const interval = setInterval(() => {
      this.sendDroneUpdates(socket);
      this.sendTrafficLightUpdates(socket);
    }, 2000); // Update every 2 seconds

    this.intervals.set(socket.id, interval);
  }

  stopUpdatesForUser(socket) {
    const interval = this.intervals.get(socket.id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(socket.id);
    }
  }

  async sendDroneUpdates(socket) {
    try {
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
      `);

      socket.emit('drone-update', { drones });
    } catch (error) {
      console.error('Error sending drone updates:', error);
    }
  }

  async sendAlertUpdates(socket) {
    try {
      const [alerts] = await pool.execute(`
        SELECT 
          a.*,
          u1.name as created_by_name,
          d.name as drone_name
        FROM alerts a
        LEFT JOIN users u1 ON a.created_by = u1.id
        LEFT JOIN drones d ON a.drone_id = d.id
        WHERE a.status = 'active'
        ORDER BY 
          CASE 
            WHEN a.priority = 'critical' THEN 1
            WHEN a.priority = 'high' THEN 2
            WHEN a.priority = 'medium' THEN 3
            WHEN a.priority = 'low' THEN 4
          END,
          a.created_at DESC
        LIMIT 20
      `);

      socket.emit('alert-update', { alerts });
    } catch (error) {
      console.error('Error sending alert updates:', error);
    }
  }

  async sendTrafficLightUpdates(socket) {
    try {
      const [lights] = await pool.execute('SELECT * FROM traffic_lights ORDER BY created_at');
      socket.emit('traffic-light-update', { lights });
    } catch (error) {
      console.error('Error sending traffic light updates:', error);
    }
  }

  startGlobalUpdates() {
    // Simulate vehicle count updates
    setInterval(async () => {
      try {
        const [drones] = await pool.execute('SELECT id FROM drones WHERE status = "online"');
        
        for (const drone of drones) {
          // Generate random vehicle counts
          const cars = Math.max(0, Math.floor(Math.random() * 100) + 20);
          const trucks = Math.max(0, Math.floor(Math.random() * 20) + 5);
          const buses = Math.max(0, Math.floor(Math.random() * 10) + 2);
          const bikes = Math.max(0, Math.floor(Math.random() * 30) + 5);
          
          const totalVehicles = cars + trucks + buses + bikes;
          let congestionLevel = 'low';
          if (totalVehicles > 100) congestionLevel = 'high';
          else if (totalVehicles > 60) congestionLevel = 'medium';

          await pool.execute(`
            INSERT INTO vehicle_counts (drone_id, cars, trucks, buses, bikes, congestion_level)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [drone.id, cars, trucks, buses, bikes, congestionLevel]);
        }

        // Broadcast updates to all authenticated users
        this.io.to('authenticated').emit('vehicle-count-update', {
          timestamp: new Date(),
          message: 'Vehicle counts updated'
        });

      } catch (error) {
        console.error('Error in global vehicle count update:', error);
      }
    }, 5000); // Update every 5 seconds

    // Simulate traffic light phase changes
    setInterval(async () => {
      try {
        const [lights] = await pool.execute('SELECT * FROM traffic_lights WHERE status = "active"');
        
        for (const light of lights) {
          let newTimeRemaining = Math.max(0, light.time_remaining - 1);
          let newPhase = light.current_phase;

          if (newTimeRemaining === 0) {
            // Change phase
            const phases = ['red', 'yellow', 'green'];
            const currentIndex = phases.indexOf(light.current_phase);
            newPhase = phases[(currentIndex + 1) % phases.length];
            
            // Set new timing based on phase
            if (newPhase === 'green') newTimeRemaining = 60;
            else if (newPhase === 'red') newTimeRemaining = 45;
            else newTimeRemaining = 5; // yellow
          }

          await pool.execute(`
            UPDATE traffic_lights 
            SET current_phase = ?, time_remaining = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `, [newPhase, newTimeRemaining, light.id]);
        }

      } catch (error) {
        console.error('Error in traffic light update:', error);
      }
    }, 1000); // Update every second
  }

  // Broadcast new alert to all users
  async broadcastNewAlert(alertData) {
    this.io.to('authenticated').emit('new-alert', alertData);
  }

  // Broadcast alert resolution
  async broadcastAlertResolution(alertId) {
    this.io.to('authenticated').emit('alert-resolved', { alertId });
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get user statistics
  getUserStatistics() {
    const users = Array.from(this.connectedUsers.values());
    const roles = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total: users.length,
      roles,
      averageSessionTime: users.length > 0 
        ? users.reduce((acc, user) => acc + (Date.now() - user.connectedAt.getTime()), 0) / users.length / 1000 / 60
        : 0
    };
  }
}

module.exports = RealTimeService;