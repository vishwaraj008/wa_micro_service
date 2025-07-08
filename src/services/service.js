const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// Environment variables
const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID; // Still needed for sending messages

// Validate required environment variables on module load
if (!accessToken) {
  console.warn('WHATSAPP_ACCESS_TOKEN not set in environment variables');
}
if (!businessAccountId) {
  console.warn('WHATSAPP_BUSINESS_ACCOUNT_ID not set in environment variables');
}
if (!phoneNumberId) {
  console.warn('WHATSAPP_PHONE_NUMBER_ID not set in environment variables (needed for sending messages)');
}

// Upload media to WhatsApp function
const uploadMediaToWhatsApp = async (fileData) => {
  try {
    // Validate environment variables
    if (!accessToken || !businessAccountId) {
      throw new Error('WhatsApp API credentials not configured. Please set WHATSAPP_ACCESS_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID environment variables.');
    }

    // Create form data for media upload
    const formData = new FormData();
    formData.append('file', fs.createReadStream(fileData.path));
    formData.append('type', fileData.mimetype);
    formData.append('messaging_product', 'whatsapp');

    // Upload media to WhatsApp using Business Account ID
    const uploadResponse = await axios.post(
      `${whatsappApiUrl}/${businessAccountId}/media`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
          ...formData.getHeaders()
        },
        timeout: 30000, // 30 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB
        maxBodyLength: 50 * 1024 * 1024 // 50MB
      }
    );

    // Check if upload was successful
    if (!uploadResponse.data || !uploadResponse.data.id) {
      throw new Error('Failed to get media ID from WhatsApp API');
    }

    const mediaId = uploadResponse.data.id;
    
    // Log successful upload
    console.log(`Media uploaded successfully. Media ID: ${mediaId}`);
    
    return {
      container_id: mediaId,
      upload_status: 'success',
      file_info: {
        original_name: fileData.originalname,
        size: fileData.size,
        type: fileData.mimetype
      }
    };

  } catch (error) {
    console.error('WhatsApp API Error:', error.message);
    
    // Enhanced error handling
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
      
      // Handle specific WhatsApp API errors
      if (error.response.status === 401) {
        throw new Error('Invalid WhatsApp access token');
      } else if (error.response.status === 400) {
        throw new Error(`WhatsApp API validation error: ${error.response.data?.error?.message || 'Bad request'}`);
      } else if (error.response.status === 413) {
        throw new Error('File too large for WhatsApp API');
      } else if (error.response.status === 429) {
        throw new Error('WhatsApp API rate limit exceeded');
      }
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - WhatsApp API took too long to respond');
    } else if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to WhatsApp API');
    }
    
    throw error;
  }
};

module.exports = {
  uploadMediaToWhatsApp
};
