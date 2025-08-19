import express from 'express';
import passport from 'passport';
import { createPlace, getAllPlaces, getPlaceById, searchPlaces, updatePlace, deletePlace } from '../models/Place';

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /api/places:
 *   get:
 *     summary: 모든 장소 조회
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 장소명 또는 주소 검색
 *     responses:
 *       200:
 *         description: 장소 목록 조회 성공
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const { search } = req.query;
    
    let places;
    if (search) {
      places = await searchPlaces(search as string);
    } else {
      places = await getAllPlaces();
    }
    
    res.json(places);
  } catch (error) {
    console.error('Get places error:', error);
    res.status(500).json({ message: '장소 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/places:
 *   post:
 *     summary: 새 장소 생성
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [attraction, restaurant, accommodation, shopping, activity]
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               operating_hours:
 *                 type: string
 *               average_cost:
 *                 type: number
 *     responses:
 *       201:
 *         description: 장소 생성 성공
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const placeData = req.body;
    
    if (!placeData.name || !placeData.category) {
      return res.status(400).json({ message: '장소명과 카테고리는 필수입니다.' });
    }
    
    const placeId = await createPlace(placeData);
    
    res.status(201).json({
      message: '장소가 생성되었습니다.',
      placeId
    });
  } catch (error) {
    console.error('Create place error:', error);
    res.status(500).json({ message: '장소 생성 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/places/{id}:
 *   get:
 *     summary: 특정 장소 조회
 *     tags: [Places]
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
 *         description: 장소 조회 성공
 */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);
    const place = await getPlaceById(placeId);
    
    if (!place) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }
    
    res.json(place);
  } catch (error) {
    console.error('Get place error:', error);
    res.status(500).json({ message: '장소 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/places/{id}:
 *   put:
 *     summary: 장소 정보 수정
 *     tags: [Places]
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
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               category:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               phone:
 *                 type: string
 *               website:
 *                 type: string
 *               operating_hours:
 *                 type: string
 *               average_cost:
 *                 type: number
 *     responses:
 *       200:
 *         description: 장소 수정 성공
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);
    const updates = req.body;
    
    const success = await updatePlace(placeId, updates);
    
    if (!success) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '장소 정보가 수정되었습니다.' });
  } catch (error) {
    console.error('Update place error:', error);
    res.status(500).json({ message: '장소 수정 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/places/{id}:
 *   delete:
 *     summary: 장소 삭제
 *     tags: [Places]
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
 *         description: 장소 삭제 성공
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);
    const success = await deletePlace(placeId);
    
    if (!success) {
      return res.status(404).json({ message: '장소를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '장소가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete place error:', error);
    res.status(500).json({ message: '장소 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;