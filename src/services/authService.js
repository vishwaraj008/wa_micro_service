const database = require('../config/database');
const { verifyKey } = require('../utils/secretKeyUtil');
const { AuthenticationError, ValidationError } = require('../utils/errors');

async function authenticateService(serviceIdentifier, serviceSecret) {
  try {
    if (!serviceIdentifier || !serviceSecret) {
      throw new ValidationError('Service identifier and service secret are required', {
        service: 'authService.authenticateService',
        missing: {
          serviceIdentifier: !serviceIdentifier,
          serviceSecret: !serviceSecret
        }
      });
    }

    const query = 'SELECT * FROM services WHERE service_indetifier = ?';
    const results = await database.query(query, [serviceIdentifier]);

    if (!results || results.length === 0) {
      throw new AuthenticationError('Service not found', {
        service: 'authService.authenticateService',
        serviceIdentifier: serviceIdentifier
      });
    }

    const service = results[0];
    
    const isValidSecret = await verifyKey(serviceSecret, service.service_secret);

    if (!isValidSecret) {
      throw new AuthenticationError('Invalid service secret', {
        service: 'authService.authenticateService',
        serviceIdentifier: serviceIdentifier
      });
    }

    return {
      id: service.id,
      service_name: service.service_name,
      service_identifier: service.service_indetifier,
      authenticated: true,
      authenticated_at: new Date().toISOString()
    };

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof AuthenticationError || error instanceof ValidationError) {
      throw error;
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new AuthenticationError('Database connection failed', {
        service: 'authService.authenticateService',
        error: error.message
      });
    }
    
    throw new AuthenticationError('Authentication failed', {
      service: 'authService.authenticateService',
      error: error.message
    });
  }
}

async function getServiceByIdentifier(serviceIdentifier) {
  try {
    if (!serviceIdentifier) {
      throw new ValidationError('Service identifier is required');
    }

    const query = 'SELECT id, service_name, service_indetifier FROM services WHERE service_indetifier = ?';
    const results = await database.query(query, [serviceIdentifier]);

    if (!results || results.length === 0) {
      return null;
    }

    return results[0];
  } catch (error) {
    console.error('Error fetching service:', error);
    throw error;
  }
}

module.exports = {
  authenticateService,
  getServiceByIdentifier
};
