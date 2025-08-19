import express from 'express';
import passport from 'passport';
import path from 'path';
import fs from 'fs/promises';
import { upload, processImages } from '../middleware/upload';
import { createPhoto, getPhotosByTravelId, getPhotoById, updatePhoto, deletePhoto } from '../models/Photo';

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /api/photos/upload/{travelId}:
 *   post:
 *     summary: 여행에 사진 업로드
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: travelId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *               captions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: 사진 업로드 성공
 */
router.post('/upload/:travelId', authenticateJWT, upload.array('photos', 10), processImages, async (req, res) => {
  try {
    const travelId = parseInt(req.params.travelId);
    const captions = req.body.captions || [];
    
    if (!req.processedFiles || req.processedFiles.length === 0) {
      return res.status(400).json({ message: '업로드할 사진이 없습니다.' });
    }

    const uploadedPhotos = [];

    for (let i = 0; i < req.processedFiles.length; i++) {
      const file = req.processedFiles[i];
      const caption = Array.isArray(captions) ? captions[i] : captions;

      const photoId = await createPhoto({
        travel_id: travelId,
        filename: file.filename,
        original_name: file.originalName,
        size: file.size,
        caption: caption || undefined
      });

      uploadedPhotos.push({
        id: photoId,
        filename: file.filename,
        originalName: file.originalName,
        caption: caption
      });
    }

    res.status(201).json({
      message: `${uploadedPhotos.length}개의 사진이 업로드되었습니다.`,
      photos: uploadedPhotos
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({ message: '사진 업로드 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/photos/travel/{travelId}:
 *   get:
 *     summary: 여행의 모든 사진 조회
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: travelId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 사진 목록 조회 성공
 */
router.get('/travel/:travelId', authenticateJWT, async (req, res) => {
  try {
    const travelId = parseInt(req.params.travelId);
    const photos = await getPhotosByTravelId(travelId);
    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ message: '사진 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/photos/{id}:
 *   get:
 *     summary: 특정 사진 조회
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 사진 조회 성공
 */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const photo = await getPhotoById(photoId);
    
    if (!photo) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }
    
    res.json(photo);
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ message: '사진 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/photos/{id}:
 *   put:
 *     summary: 사진 정보 수정
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caption:
 *                 type: string
 *               place_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 사진 정보 수정 성공
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    const updates = req.body;
    
    const success = await updatePhoto(photoId, updates);
    
    if (!success) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '사진 정보가 수정되었습니다.' });
  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({ message: '사진 수정 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/photos/{id}:
 *   delete:
 *     summary: 사진 삭제
 *     tags: [Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 사진 삭제 성공
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const photoId = parseInt(req.params.id);
    
    // 사진 정보 조회
    const photo = await getPhotoById(photoId);
    if (!photo) {
      return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }
    
    // 데이터베이스에서 삭제
    const success = await deletePhoto(photoId);
    
    if (success) {
      // 파일 시스템에서 삭제
      try {
        const photoPath = path.join(process.cwd(), 'uploads', 'photos', photo.filename);
        const thumbnailPath = path.join(process.cwd(), 'uploads', 'thumbnails', `thumb-${photo.filename}`);
        
        await fs.unlink(photoPath).catch(() => {}); // 파일이 없어도 에러 무시
        await fs.unlink(thumbnailPath).catch(() => {});
      } catch (fileError) {
        console.error('File deletion error:', fileError);
      }
      
      res.json({ message: '사진이 삭제되었습니다.' });
    } else {
      res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ message: '사진 삭제 중 오류가 발생했습니다.' });
  }
});

// 이미지 파일 서빙
router.get('/file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'photos', filename);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
    }
  });
});

// 썸네일 이미지 서빙
router.get('/thumbnail/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), 'uploads', 'thumbnails', `thumb-${filename}`);
  
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: '썸네일을 찾을 수 없습니다.' });
    }
  });
});

export default router;