const { authenticateService: authServiceFunction } = require('../services/authService');
const { AuthenticationError, ValidationError } = require('../utils/errors');

const authenticateService = async (req, res, next) => {
  try {
    const serviceIdentifier = req.body.service_identifier || req.headers['x-service-identifier'];
    const serviceSecret = req.body.service_secret || req.headers['x-service-secret'];

    if (!serviceIdentifier || !serviceSecret) {
      return res.status(400).json({
        error: 'Authentication failed',
        message: 'service_identifier and service_secret are required',
        details: {
          service_identifier: !serviceIdentifier ? 'Missing service_identifier in request body or x-service-identifier header' : null,
          service_secret: !serviceSecret ? 'Missing service_secret in request body or x-service-secret header' : null
        }
      });
    }

    const authenticatedService = await authServiceFunction(serviceIdentifier, serviceSecret);

    req.authenticatedService = authenticatedService;
    

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);

    if (error instanceof AuthenticationError) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: error.message,
        details: error.details
      });
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
        details: error.details
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Database connection failed. Please try again later.'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during authentication'
    });
  }
};

const optionalAuthenticateService = async (req, res, next) => {
  try {
    const serviceIdentifier = req.body.service_identifier || req.headers['x-service-identifier'];
    const serviceSecret = req.body.service_secret || req.headers['x-service-secret'];

    if (!serviceIdentifier || !serviceSecret) {
      req.authenticatedService = null;
      return next();
    }

    const authenticatedService = await authServiceFunction(serviceIdentifier, serviceSecret);
    req.authenticatedService = authenticatedService;
    
    
    next();
  } catch (error) {
    console.error('Optional authentication middleware error:', error);
    
    req.authenticatedService = null;
    next();
  }
};

module.exports = {
  authenticateService,
  optionalAuthenticateService
};
