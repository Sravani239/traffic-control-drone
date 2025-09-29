const { pool } = require('../config/database');

const logActivity = async (req, res, next) => {
  // Store original res.json
  const originalJson = res.json;
  
  // Override res.json to capture response
  res.json = function(data) {
    // Log the activity if user is authenticated and action was successful
    if (req.user && res.statusCode < 400) {
      logUserActivity(req, data).catch(console.error);
    }
    
    // Call original res.json
    return originalJson.call(this, data);
  };
  
  next();
};

const logUserActivity = async (req, responseData) => {
  try {
    const action = `${req.method} ${req.route?.path || req.path}`;
    const resource = extractResourceFromPath(req.path);
    const resourceId = req.params.id || null;
    
    const details = {
      method: req.method,
      path: req.path,
      query: req.query,
      body: sanitizeBody(req.body),
      statusCode: req.res?.statusCode
    };

    await pool.execute(`
      INSERT INTO system_logs (user_id, action, resource, resource_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      action,
      resource,
      resourceId,
      JSON.stringify(details),
      req.ip || req.connection.remoteAddress,
      req.get('User-Agent') || null
    ]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

const extractResourceFromPath = (path) => {
  const segments = path.split('/').filter(Boolean);
  if (segments.length >= 2) {
    return segments[1]; // e.g., /api/drones -> drones
  }
  return segments[0] || 'unknown';
};

const sanitizeBody = (body) => {
  if (!body) return null;
  
  const sanitized = { ...body };
  
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  
  return sanitized;
};

module.exports = {
  logActivity
};