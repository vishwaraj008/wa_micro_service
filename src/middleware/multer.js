const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/',
    'video/',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/json',
    'application/xml',
    'text/xml'
  ];
  
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 1
  }
});

const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size should be less than 50MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file is allowed'
      });
    }
  }
  
  if (error.message === 'File type not supported!') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'File type not supported. Supported types: images, videos, PDF, Word documents, Excel files, PowerPoint presentations, text files, CSV, RTF, ZIP, RAR, 7Z, JSON, XML'
    });
  }
  
  next(error);
};

module.exports = {
  upload,
  handleMulterError
};
