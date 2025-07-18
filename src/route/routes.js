const express = require('express');
const { uploadMedia } = require('../controller/controller');
const { upload, handleMulterError } = require('../middleware/multer');
const rateLimiter = require('../middleware/rateLimiter');
const { authenticateService } = require('../middleware/auth');
const { uploadMediaValidation, handleValidationErrors } = require('../validators/validator');

const router = express.Router();

router.post('/whatsapp/media', rateLimiter, authenticateService, uploadMediaValidation, handleValidationErrors, upload.single('media'), uploadMedia);

router.use(handleMulterError);

module.exports = router;
