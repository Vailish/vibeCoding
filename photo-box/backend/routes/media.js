const express = require('express');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// JWT middleware for admin routes
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Get media files for a wedding event
router.get('/:code/media', async (req, res) => {
  try {
    const { code } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if wedding event exists
    const weddingResult = await db.query(
      'SELECT id FROM wedding_events WHERE event_code = $1 AND is_active = true',
      [code]
    );
    
    if (weddingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wedding event not found' });
    }
    
    const weddingId = weddingResult.rows[0].id;
    
    // Build query based on filters
    let query = `
      SELECT * FROM media_files 
      WHERE wedding_event_id = $1
    `;
    let params = [weddingId];
    
    if (type && ['image', 'video'].includes(type)) {
      query += ` AND file_type = $2`;
      params.push(type);
    }
    
    query += ` ORDER BY uploaded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) FROM media_files 
      WHERE wedding_event_id = $1
    `;
    let countParams = [weddingId];
    
    if (type && ['image', 'video'].includes(type)) {
      countQuery += ` AND file_type = $2`;
      countParams.push(type);
    }
    
    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    
    res.json({
      success: true,
      media: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ error: 'Failed to get media files' });
  }
});

// Get media statistics
router.get('/:code/stats', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Check if wedding event exists
    const weddingResult = await db.query(
      'SELECT id FROM wedding_events WHERE event_code = $1 AND is_active = true',
      [code]
    );
    
    if (weddingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Wedding event not found' });
    }
    
    const weddingId = weddingResult.rows[0].id;
    
    // Get statistics
    const statsResult = await db.query(
      `SELECT 
        COUNT(*) as total_files,
        COUNT(CASE WHEN file_type = 'image' THEN 1 END) as image_count,
        COUNT(CASE WHEN file_type = 'video' THEN 1 END) as video_count,
        SUM(file_size) as total_size,
        SUM(likes_count) as total_likes,
        COUNT(DISTINCT uploader_name) as unique_uploaders
       FROM media_files 
       WHERE wedding_event_id = $1`,
      [weddingId]
    );
    
    const stats = statsResult.rows[0];
    
    res.json({
      success: true,
      stats: {
        totalFiles: parseInt(stats.total_files),
        imageCount: parseInt(stats.image_count),
        videoCount: parseInt(stats.video_count),
        totalSize: parseInt(stats.total_size || 0),
        totalLikes: parseInt(stats.total_likes || 0),
        uniqueUploaders: parseInt(stats.unique_uploaders)
      }
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Like/unlike media file
router.post('/:code/media/:id/like', async (req, res) => {
  try {
    const { code, id } = req.params;
    
    // Check if wedding event and media file exist
    const mediaResult = await db.query(
      `SELECT mf.* FROM media_files mf
       JOIN wedding_events we ON mf.wedding_event_id = we.id
       WHERE we.event_code = $1 AND mf.id = $2 AND we.is_active = true`,
      [code, id]
    );
    
    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    // Increment likes
    const result = await db.query(
      'UPDATE media_files SET likes_count = likes_count + 1 WHERE id = $1 RETURNING likes_count',
      [id]
    );
    
    const newLikesCount = result.rows[0].likes_count;
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(code).emit('like_update', {
      mediaId: parseInt(id),
      likesCount: newLikesCount
    });
    
    res.json({
      success: true,
      likesCount: newLikesCount
    });
    
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to like media file' });
  }
});

// Delete media file (admin only)
router.delete('/:code/media/:id', authenticateAdmin, async (req, res) => {
  try {
    const { code, id } = req.params;
    
    // Check if user has access to this wedding
    if (req.user.eventCode !== code) {
      return res.status(403).json({ error: 'Access denied to this wedding event' });
    }
    
    // Get file info before deletion
    const mediaResult = await db.query(
      `SELECT mf.* FROM media_files mf
       JOIN wedding_events we ON mf.wedding_event_id = we.id
       WHERE we.event_code = $1 AND mf.id = $2`,
      [code, id]
    );
    
    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Media file not found' });
    }
    
    const media = mediaResult.rows[0];
    
    // Delete from database
    await db.query('DELETE FROM media_files WHERE id = $1', [id]);
    
    // Delete files from filesystem
    const filePath = path.join(process.env.UPLOAD_PATH || './uploads', code, media.file_name);
    try {
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.warn('Failed to delete file:', filePath);
    }
    
    // Delete thumbnail if exists
    if (media.thumbnail_url) {
      const thumbnailPath = path.join(process.env.UPLOAD_PATH || './uploads', code, `thumb_${media.file_name}`);
      try {
        await fs.promises.unlink(thumbnailPath);
      } catch (error) {
        console.warn('Failed to delete thumbnail:', thumbnailPath);
      }
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Delete media error:', error);
    res.status(500).json({ error: 'Failed to delete media file' });
  }
});

// Download all files as ZIP (admin only)
router.get('/:code/download', authenticateAdmin, async (req, res) => {
  try {
    const { code } = req.params;
    
    // Check if user has access to this wedding
    if (req.user.eventCode !== code) {
      return res.status(403).json({ error: 'Access denied to this wedding event' });
    }
    
    // Get all media files
    const mediaResult = await db.query(
      `SELECT mf.* FROM media_files mf
       JOIN wedding_events we ON mf.wedding_event_id = we.id
       WHERE we.event_code = $1
       ORDER BY mf.uploaded_at ASC`,
      [code]
    );
    
    if (mediaResult.rows.length === 0) {
      return res.status(404).json({ error: 'No files found' });
    }
    
    // Set response headers for zip download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${code}-photos.zip"`);
    
    // Create zip archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);
    
    // Add files to archive
    const uploadsPath = path.join(process.env.UPLOAD_PATH || './uploads', code);
    
    for (const media of mediaResult.rows) {
      const filePath = path.join(uploadsPath, media.file_name);
      try {
        if (fs.existsSync(filePath)) {
          const fileName = `${media.original_name}`;
          archive.file(filePath, { name: fileName });
        }
      } catch (error) {
        console.warn(`Failed to add file to archive: ${filePath}`);
      }
    }
    
    archive.finalize();
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to create download' });
  }
});

module.exports = router;