import express from 'express';
import passport from 'passport';
import { 
  createItinerary, 
  getItinerariesByTravelId, 
  getItineraryById, 
  updateItinerary, 
  deleteItinerary,
  addPlaceToItinerary,
  getItineraryPlaces,
  removePlaceFromItinerary
} from '../models/Itinerary';

const router = express.Router();
const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /api/itineraries/travel/{travelId}:
 *   get:
 *     summary: 여행의 모든 일정 조회
 *     tags: [Itineraries]
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
 *         description: 일정 목록 조회 성공
 */
router.get('/travel/:travelId', authenticateJWT, async (req, res) => {
  try {
    const travelId = parseInt(req.params.travelId);
    const itineraries = await getItinerariesByTravelId(travelId);
    res.json(itineraries);
  } catch (error) {
    console.error('Get itineraries error:', error);
    res.status(500).json({ message: '일정 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries:
 *   post:
 *     summary: 새 일정 생성
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               travel_id:
 *                 type: integer
 *               date:
 *                 type: string
 *                 format: date
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               estimated_cost:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: 일정 생성 성공
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const itineraryData = req.body;
    
    if (!itineraryData.travel_id || !itineraryData.date || !itineraryData.title) {
      return res.status(400).json({ message: '여행 ID, 날짜, 제목은 필수입니다.' });
    }
    
    const itineraryId = await createItinerary({
      ...itineraryData,
      date: new Date(itineraryData.date)
    });
    
    res.status(201).json({
      message: '일정이 생성되었습니다.',
      itineraryId
    });
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({ message: '일정 생성 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries/{id}:
 *   get:
 *     summary: 특정 일정 조회
 *     tags: [Itineraries]
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
 *         description: 일정 조회 성공
 */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const itineraryId = parseInt(req.params.id);
    const itinerary = await getItineraryById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    
    res.json(itinerary);
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ message: '일정 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries/{id}:
 *   put:
 *     summary: 일정 수정
 *     tags: [Itineraries]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               start_time:
 *                 type: string
 *               end_time:
 *                 type: string
 *               estimated_cost:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 일정 수정 성공
 */
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const itineraryId = parseInt(req.params.id);
    const updates = req.body;
    
    const success = await updateItinerary(itineraryId, updates);
    
    if (!success) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '일정이 수정되었습니다.' });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ message: '일정 수정 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries/{id}:
 *   delete:
 *     summary: 일정 삭제
 *     tags: [Itineraries]
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
 *         description: 일정 삭제 성공
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const itineraryId = parseInt(req.params.id);
    const success = await deleteItinerary(itineraryId);
    
    if (!success) {
      return res.status(404).json({ message: '일정을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '일정이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ message: '일정 삭제 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries/{id}/places:
 *   get:
 *     summary: 일정의 모든 장소 조회
 *     tags: [Itineraries]
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
 *         description: 일정 장소 목록 조회 성공
 */
router.get('/:id/places', authenticateJWT, async (req, res) => {
  try {
    const itineraryId = parseInt(req.params.id);
    const places = await getItineraryPlaces(itineraryId);
    res.json(places);
  } catch (error) {
    console.error('Get itinerary places error:', error);
    res.status(500).json({ message: '일정 장소 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries/{id}/places:
 *   post:
 *     summary: 일정에 장소 추가
 *     tags: [Itineraries]
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
 *               place_id:
 *                 type: integer
 *               order_index:
 *                 type: integer
 *               arrival_time:
 *                 type: string
 *               departure_time:
 *                 type: string
 *     responses:
 *       201:
 *         description: 장소 추가 성공
 */
router.post('/:id/places', authenticateJWT, async (req, res) => {
  try {
    const itineraryId = parseInt(req.params.id);
    const { place_id, order_index, arrival_time, departure_time } = req.body;
    
    if (!place_id) {
      return res.status(400).json({ message: '장소 ID는 필수입니다.' });
    }
    
    const itineraryPlaceId = await addPlaceToItinerary(
      itineraryId,
      place_id,
      order_index,
      arrival_time,
      departure_time
    );
    
    res.status(201).json({
      message: '장소가 일정에 추가되었습니다.',
      itineraryPlaceId
    });
  } catch (error) {
    console.error('Add place to itinerary error:', error);
    res.status(500).json({ message: '장소 추가 중 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/itineraries/places/{itineraryPlaceId}:
 *   delete:
 *     summary: 일정에서 장소 제거
 *     tags: [Itineraries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itineraryPlaceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 장소 제거 성공
 */
router.delete('/places/:itineraryPlaceId', authenticateJWT, async (req, res) => {
  try {
    const itineraryPlaceId = parseInt(req.params.itineraryPlaceId);
    const success = await removePlaceFromItinerary(itineraryPlaceId);
    
    if (!success) {
      return res.status(404).json({ message: '일정 장소를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '장소가 일정에서 제거되었습니다.' });
  } catch (error) {
    console.error('Remove place from itinerary error:', error);
    res.status(500).json({ message: '장소 제거 중 오류가 발생했습니다.' });
  }
});

export default router;