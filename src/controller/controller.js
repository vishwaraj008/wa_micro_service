const { uploadMediaToWhatsApp } = require('../services/service');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

const uploadMedia = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Request validation failed',
        details: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a file (image, video, or document)'
      });
    }

    const { phone_number, whatsapp_access_token, whatsapp_business_account_id } = req.body;
    const authenticatedService = req.authenticatedService;

    const fileData = {
      path: req.file.path,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    const result = await uploadMediaToWhatsApp(fileData, whatsapp_access_token, whatsapp_business_account_id);

    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      container_id: result.container_id,
      message: 'Media uploaded successfully',
      authenticated_service: {
        service_name: authenticatedService.service_name,
        service_identifier: authenticatedService.service_identifier,
        authenticated_at: authenticatedService.authenticated_at
      },
      metadata: {
        filename: fileData.originalname,
        size: fileData.size,
        type: fileData.mimetype,
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: error.message,
        details: error.details || []
      });
    } else if (error.response) {
      return res.status(error.response.status || 500).json({
        error: 'WhatsApp API Error',
        message: error.response.data?.error?.message || 'Failed to upload media to WhatsApp',
        details: error.response.data
      });
    } else if (error.code === 'ENOENT') {
      return res.status(400).json({
        error: 'File Error',
        message: 'Uploaded file not found'
      });
    } else {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while uploading media'
      });
    }
  }
};

module.exports = {
  uploadMedia
};
