const express = require('express');
const { uploadMedia } = require('../controller/controller');
const { upload, handleMulterError } = require('../middleware/multer');

const router = express.Router();

// Routes
router.post('/whatsapp/media', upload.single('media'), uploadMedia);

// Error handling for multer
router.use(handleMulterError);

module.exports = router;
