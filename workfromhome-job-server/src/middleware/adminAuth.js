const env = require('../config/env');

function adminAuth(req, res, next) {
  if (!env.adminApiKey) {
    return next();
  }

  const incomingKey = req.header('x-admin-key');
  if (!incomingKey || incomingKey !== env.adminApiKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized admin request'
    });
  }

  return next();
}

module.exports = adminAuth;
