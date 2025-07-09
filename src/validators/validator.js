const { body, validationResult } = require('express-validator');

const uploadMediaValidation = [
  
  body('whatsapp_access_token')
    .notEmpty()
    .withMessage('whatsapp_access_token is required')
    .isLength({ min: 10 })
    .withMessage('Invalid whatsapp_access_token '),
  
  body('whatsapp_business_account_id')
    .notEmpty()
    .withMessage('whatsapp_business_account_id is required')
    .isLength({ min: 10 })
    .withMessage('Invalid whatsapp_business_account_id'),
  
  body('service_identifier')
    .optional()
    .isNumeric()
    .withMessage('Invalid service_identifier'),
  
  body('service_secret')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Invalid service_secret')
];

const authValidation = [
  body('service_identifier')
    .optional()
    .isNumeric()
    .withMessage('Invalid service_identifier'),
  
  body('service_secret')
    .optional()
    .isLength({ min: 10, max: 10 })
    .withMessage('Invalid service_secret')
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Request validation failed',
      details: errors.array()
    });
  }
  next();
}

module.exports = {
  uploadMediaValidation,
  authValidation,
  handleValidationErrors
};
