# Traffic Monitoring Drone System - Backend API

A comprehensive Node.js backend API for the Traffic Monitoring Drone System with real-time capabilities, MySQL database, and Socket.IO integration.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Real-time Updates**: Socket.IO for live drone feeds and alerts
- **Comprehensive APIs**: Full CRUD operations for all system entities
- **Database Integration**: MySQL with connection pooling
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Logging**: Activity logging and system monitoring
- **Analytics**: Traffic analytics and reporting endpoints

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env` file and update with your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=traffic_monitoring
   JWT_SECRET=your_super_secret_jwt_key
   ```

3. **Initialize database:**
   ```bash
   npm run init-db
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Schema

### Tables Overview

- **users**: System users with role-based access
- **drones**: Drone information and status
- **vehicle_counts**: Real-time vehicle counting data
- **alerts**: System alerts and incidents
- **traffic_lights**: Traffic light control and status
- **traffic_analytics**: Historical traffic data
- **system_logs**: Activity and audit logs

### Default Credentials

- **Email**: admin@traffic.gov
- **Password**: admin123
- **Role**: Administrator

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify token

### Drones
- `GET /api/drones` - Get all drones
- `GET /api/drones/:id` - Get specific drone
- `PATCH /api/drones/:id/status` - Update drone status
- `GET /api/drones/:id/history` - Get drone history
- `POST /api/drones/:id/vehicle-count` - Add vehicle count data

### Alerts
- `GET /api/alerts` - Get alerts (with filtering)
- `POST /api/alerts` - Create new alert
- `PATCH /api/alerts/:id/resolve` - Resolve alert
- `GET /api/alerts/stats` - Get alert statistics

### Traffic Lights
- `GET /api/traffic-lights` - Get all traffic lights
- `GET /api/traffic-lights/:id` - Get specific traffic light
- `PATCH /api/traffic-lights/:id/mode` - Update control mode
- `PATCH /api/traffic-lights/:id/phase` - Update phase (manual mode)
- `GET /api/traffic-lights/stats/overview` - Get statistics

### Analytics
- `GET /api/analytics/overview` - System overview stats
- `GET /api/analytics/hourly-traffic` - Hourly traffic data
- `GET /api/analytics/vehicle-types` - Vehicle type distribution
- `GET /api/analytics/congestion-hotspots` - Congestion analysis
- `GET /api/analytics/incident-response` - Response time analytics
- `GET /api/analytics/daily-summary` - Daily summary report

### System
- `GET /health` - Health check
- `GET /api/system/status` - System status and metrics

## 🔄 Real-time Features

The system uses Socket.IO for real-time communication:

### Client Events
- `authenticate` - Authenticate socket connection
- `start-updates` - Start receiving real-time updates
- `stop-updates` - Stop real-time updates

### Server Events
- `drone-update` - Live drone data updates
- `alert-update` - Alert notifications
- `traffic-light-update` - Traffic light status changes
- `vehicle-count-update` - Vehicle count updates
- `new-alert` - New alert broadcast
- `alert-resolved` - Alert resolution notification

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Admin, Operator, and Viewer roles
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security
- **Helmet Security**: HTTP security headers
- **Input Validation**: Request data validation
- **Activity Logging**: Comprehensive audit trail

## 📊 Monitoring & Logging

- **System Logs**: All user activities logged to database
- **Error Handling**: Comprehensive error logging
- **Performance Metrics**: Server performance monitoring
- **Real-time Statistics**: Connected users and system status

## 🚦 Traffic Light Control

The system supports three control modes:

1. **Manual**: Direct operator control
2. **Auto**: Pre-programmed timing cycles
3. **Smart**: AI-based adaptive timing (simulated)

## 📈 Analytics & Reporting

- Real-time traffic volume monitoring
- Vehicle type classification and counting
- Congestion level analysis
- Incident response time tracking
- Historical data analysis
- Daily/weekly/monthly reports

## 🔧 Development

### Project Structure
```
server/
├── config/          # Database configuration
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── services/        # Business logic services
├── scripts/         # Database initialization
└── server.js        # Main application file
```

### Adding New Features

1. Create route handlers in `routes/`
2. Add middleware if needed in `middleware/`
3. Update database schema in `scripts/initDatabase.js`
4. Add real-time features in `services/realTimeService.js`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MySQL server is running
   - Verify credentials in `.env` file
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:5000 | xargs kill`

3. **JWT Token Issues**
   - Ensure JWT_SECRET is set in `.env`
   - Check token expiration settings

### Logs Location
- Development: Console output
- Production: Consider using PM2 or similar process manager

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Traffic Monitoring Drone System Backend API v1.0.0**