const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', req.params.code);
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 104857600 // 100MB
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = {
      'image/jpeg': true,
      'image/png': true,
      'image/heic': true,
      'video/mp4': true,
      'video/quicktime': true,
      'video/x-msvideo': true
    };
    
    if (allowedTypes[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, HEIC, MP4, MOV, AVI files are allowed.'));
    }
  }
});

// Validation schema
const uploadMetaSchema = Joi.object({
  uploaderName: Joi.string().max(100).optional().allow(''),
  comment: Joi.string().max(500).optional().allow('')
});

// Generate thumbnail for images
async function generateThumbnail(filePath, thumbnailPath) {
  try {
    await sharp(filePath)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    return thumbnailPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return null;
  }
}

// Upload files
router.post('/:code/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { code } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    // Validate metadata
    const { error, value } = uploadMetaSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    
    const { uploaderName, comment } = value;
    
    // Check if wedding event exists
    const weddingResult = await db.query(
      'SELECT id FROM wedding_events WHERE event_code = $1 AND is_active = true',
      [code]
    );
    
    if (weddingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wedding event not found' });
    }
    
    const weddingId = weddingResult.rows[0].id;
    const uploadedFiles = [];
    
    // Process each file
    for (const file of files) {
      try {
        const fileType = file.mimetype.startsWith('image/') ? 'image' : 'video';
        let thumbnailUrl = null;
        
        // Generate thumbnail for images
        if (fileType === 'image') {
          const thumbnailName = `thumb_${file.filename}`;
          const thumbnailPath = path.join(path.dirname(file.path), thumbnailName);
          
          const thumbnail = await generateThumbnail(file.path, thumbnailPath);
          if (thumbnail) {
            thumbnailUrl = `/uploads/${code}/${thumbnailName}`;
          }
        }
        
        // Insert file record into database
        const result = await db.query(
          `INSERT INTO media_files 
           (wedding_event_id, file_name, original_name, file_type, file_size, 
            file_url, thumbnail_url, uploader_name, comment) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
           RETURNING *`,
          [
            weddingId,
            file.filename,
            file.originalname,
            fileType,
            file.size,
            `/uploads/${code}/${file.filename}`,
            thumbnailUrl,
            uploaderName || null,
            comment || null
          ]
        );
        
        uploadedFiles.push(result.rows[0]);
        
      } catch (error) {
        console.error(`Error processing file ${file.filename}:`, error);
      }
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(code).emit('new_upload', {
      files: uploadedFiles,
      count: uploadedFiles.length
    });
    
    res.json({
      success: true,
      uploaded: uploadedFiles.length,
      files: uploadedFiles
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;