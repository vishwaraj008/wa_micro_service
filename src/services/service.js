const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const whatsappApiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadWithRetry(fileData, accessToken, businessAccountId, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!accessToken || !businessAccountId) {
        throw new Error('WhatsApp API credentials are required. Please provide WHATSAPP_ACCESS_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID in request.');
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(fileData.path));
      formData.append('type', fileData.mimetype);
      formData.append('messaging_product', 'whatsapp');

      const uploadResponse = await axios.post(
        `${whatsappApiUrl}/${businessAccountId}/media`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
            ...formData.getHeaders()
          },
          timeout: 30000,
          maxContentLength: 50 * 1024 * 1024,
          maxBodyLength: 50 * 1024 * 1024
        }
      );

      if (!uploadResponse.data || !uploadResponse.data.id) {
        throw new Error('Failed to get media ID from WhatsApp API');
      }

      const mediaId = uploadResponse.data.id;
      
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
      console.error(`Upload attempt ${attempt} failed:`, error.message);
      
      if (error.response) {
        console.error('API Response Status:', error.response.status);
        console.error('API Response Data:', error.response.data);
        
        if (error.response.status === 401) {
          throw new Error('Invalid WhatsApp access token');
        } else if (error.response.status === 400) {
          throw new Error(`WhatsApp API validation error: ${error.response.data?.error?.message || 'Bad request'}`);
        } else if (error.response.status === 413) {
          throw new Error('File too large for WhatsApp API');
        }
      }
      
      if (attempt === maxRetries) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout - WhatsApp API took too long to respond');
        } else if (error.code === 'ECONNREFUSED') {
          throw new Error('Cannot connect to WhatsApp API');
        }
        throw error;
      }
      
      const delayMs = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
}

const uploadMediaToWhatsApp = async (fileData, accessToken, businessAccountId) => {
  return await uploadWithRetry(fileData, accessToken, businessAccountId, 5);
};

module.exports = {
  uploadMediaToWhatsApp
};
