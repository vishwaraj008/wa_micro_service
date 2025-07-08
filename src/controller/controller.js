const { uploadMediaToWhatsApp } = require('../services/service');
const fs = require('fs');
const path = require('path');

// Upload media function
const uploadMedia = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a file (image, video, or document)'
      });
    }

    // Validate required fields
    const { phone_number } = req.body;
    if (!phone_number) {
      // Clean up uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'phone_number is required'
      });
    }

    // Prepare file data
    const fileData = {
      path: req.file.path,
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    // Call WhatsApp service to upload media
    const result = await uploadMediaToWhatsApp(fileData, phone_number);

    // Clean up uploaded file after successful upload
    fs.unlinkSync(req.file.path);

    // Return container ID
    res.status(200).json({
      success: true,
      container_id: result.container_id,
      message: 'Media uploaded successfully',
      metadata: {
        filename: fileData.originalname,
        size: fileData.size,
        type: fileData.mimetype,
        uploaded_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Handle different error types
    if (error.response) {
      // WhatsApp API error
      return res.status(error.response.status || 500).json({
        error: 'WhatsApp API Error',
        message: error.response.data?.error?.message || 'Failed to upload media to WhatsApp',
        details: error.response.data
      });
    } else if (error.code === 'ENOENT') {
      // File not found error
      return res.status(400).json({
        error: 'File Error',
        message: 'Uploaded file not found'
      });
    } else {
      // Generic error
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
