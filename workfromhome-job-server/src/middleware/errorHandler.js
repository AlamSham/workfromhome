function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}

module.exports = {
  notFound,
  errorHandler
};
