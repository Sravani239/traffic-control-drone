const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'traffic_monitoring'}`);
    console.log('Database created/verified');

    // Use the database
    await connection.execute(`USE ${process.env.DB_NAME || 'traffic_monitoring'}`);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'operator', 'viewer') DEFAULT 'operator',
        department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    // Create drones table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS drones (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        status ENUM('online', 'offline', 'maintenance') DEFAULT 'offline',
        battery_level INT DEFAULT 100,
        altitude DECIMAL(8, 2) DEFAULT 0,
        speed DECIMAL(8, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create vehicle_counts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS vehicle_counts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        drone_id VARCHAR(50) NOT NULL,
        cars INT DEFAULT 0,
        trucks INT DEFAULT 0,
        buses INT DEFAULT 0,
        bikes INT DEFAULT 0,
        total_vehicles INT GENERATED ALWAYS AS (cars + trucks + buses + bikes) STORED,
        congestion_level ENUM('low', 'medium', 'high') DEFAULT 'low',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (drone_id) REFERENCES drones(id) ON DELETE CASCADE,
        INDEX idx_drone_timestamp (drone_id, timestamp)
      )
    `);

    // Create alerts table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type ENUM('accident', 'congestion', 'maintenance', 'emergency') NOT NULL,
        priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        drone_id VARCHAR(50),
        status ENUM('active', 'resolved', 'dismissed') DEFAULT 'active',
        created_by INT,
        resolved_by INT,
        resolved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (drone_id) REFERENCES drones(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_status_priority (status, priority),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create traffic_lights table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS traffic_lights (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        current_phase ENUM('red', 'yellow', 'green') DEFAULT 'red',
        time_remaining INT DEFAULT 30,
        cycle_time INT DEFAULT 120,
        mode ENUM('manual', 'auto', 'smart') DEFAULT 'auto',
        status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create traffic_analytics table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS traffic_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        hour TINYINT NOT NULL,
        location VARCHAR(255) NOT NULL,
        total_vehicles INT DEFAULT 0,
        average_speed DECIMAL(5, 2) DEFAULT 0,
        congestion_duration INT DEFAULT 0,
        incidents_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_analytics (date, hour, location),
        INDEX idx_date_location (date, location)
      )
    `);

    // Create system_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        resource VARCHAR(100),
        resource_id VARCHAR(100),
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_action (user_id, action),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('All tables created successfully');

    // Insert default admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await connection.execute(`
      INSERT IGNORE INTO users (name, email, password, role, department) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      'Traffic Control Admin',
      'admin@traffic.gov',
      hashedPassword,
      'admin',
      'Traffic Management Authority'
    ]);

    // Insert sample drones
    const sampleDrones = [
      {
        id: 'DRONE_01',
        name: 'Highway Monitor Alpha',
        location: 'Highway 101 - Main Junction',
        latitude: 37.7749,
        longitude: -122.4194,
        status: 'online'
      },
      {
        id: 'DRONE_02',
        name: 'Downtown Bridge Monitor',
        location: 'Downtown Bridge',
        latitude: 37.7849,
        longitude: -122.4094,
        status: 'online'
      },
      {
        id: 'DRONE_03',
        name: 'Airport Access Monitor',
        location: 'Airport Access Road',
        latitude: 37.7649,
        longitude: -122.4294,
        status: 'offline'
      }
    ];

    for (const drone of sampleDrones) {
      await connection.execute(`
        INSERT IGNORE INTO drones (id, name, location, latitude, longitude, status) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, [drone.id, drone.name, drone.location, drone.latitude, drone.longitude, drone.status]);
    }

    // Insert sample traffic lights
    const sampleLights = [
      {
        id: 'TL_001',
        name: 'Highway 101 & Oak St',
        location: 'Highway 101 & Oak St',
        latitude: 37.7749,
        longitude: -122.4194,
        current_phase: 'green',
        mode: 'smart'
      },
      {
        id: 'TL_002',
        name: 'Downtown Bridge Entry',
        location: 'Downtown Bridge Entry',
        latitude: 37.7849,
        longitude: -122.4094,
        current_phase: 'red',
        mode: 'manual'
      },
      {
        id: 'TL_003',
        name: 'Airport Access & Main',
        location: 'Airport Access & Main',
        latitude: 37.7649,
        longitude: -122.4294,
        current_phase: 'yellow',
        mode: 'auto'
      }
    ];

    for (const light of sampleLights) {
      await connection.execute(`
        INSERT IGNORE INTO traffic_lights (id, name, location, latitude, longitude, current_phase, mode) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [light.id, light.name, light.location, light.latitude, light.longitude, light.current_phase, light.mode]);
    }

    console.log('✅ Database initialization completed successfully');
    console.log('📧 Default admin user: admin@traffic.gov');
    console.log('🔑 Default password: admin123');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase();