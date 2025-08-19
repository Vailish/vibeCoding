import express from 'express';
import passport from 'passport';
import { createTravel, getTravelsByUserId, getTravelById, updateTravel, deleteTravel } from '../models/Travel';
import { checkGroupAccess, checkGroupAdminAccess } from '../middleware/groupAuth';

const router = express.Router();

// JWT 인증 미들웨어
const authenticateJWT = passport.authenticate('jwt', { session: false });

/**
 * @swagger
 * /api/travels:
 *   get:
 *     summary: 사용자의 여행 목록 조회
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 여행 목록 조회 성공
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as any;
    const travels = await getTravelsByUserId(user.id);
    res.json(travels);
  } catch (error) {
    console.error('Get travels error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/travels:
 *   post:
 *     summary: 새 여행 생성
 *     tags: [Travel]
 *     security:
 *       - bearerAuth: []
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
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *               budget:
 *                 type: number
 *     responses:
 *       201:
 *         description: 여행 생성 성공
 */
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const user = req.user as any;
    const { title, description, start_date, end_date, budget, group_id } = req.body;

    const travelId = await createTravel({
      title,
      description,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      budget,
      user_id: user.id,
      group_id
    });

    res.status(201).json({
      message: '여행이 생성되었습니다.',
      travelId
    });
  } catch (error) {
    console.error('Create travel error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/travels/{id}:
 *   get:
 *     summary: 특정 여행 조회
 *     tags: [Travel]
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
 *         description: 여행 조회 성공
 *       404:
 *         description: 여행을 찾을 수 없음
 */
router.get('/:id', authenticateJWT, checkGroupAccess, async (req, res) => {
  try {
    const travelId = parseInt(req.params.id);
    const travel = await getTravelById(travelId);

    if (!travel) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    res.json(travel);
  } catch (error) {
    console.error('Get travel error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/travels/{id}:
 *   put:
 *     summary: 여행 정보 수정
 *     tags: [Travel]
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
 *               status:
 *                 type: string
 *                 enum: [planning, ongoing, completed]
 *               budget:
 *                 type: number
 *     responses:
 *       200:
 *         description: 여행 수정 성공
 *       404:
 *         description: 여행을 찾을 수 없음
 */
router.put('/:id', authenticateJWT, checkGroupAccess, async (req, res) => {
  try {
    const travelId = parseInt(req.params.id);
    const updateData = req.body;

    const success = await updateTravel(travelId, updateData);

    if (!success) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    res.json({ message: '여행 정보가 수정되었습니다.' });
  } catch (error) {
    console.error('Update travel error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * @swagger
 * /api/travels/{id}:
 *   delete:
 *     summary: 여행 삭제
 *     tags: [Travel]
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
 *         description: 여행 삭제 성공
 *       404:
 *         description: 여행을 찾을 수 없음
 */
router.delete('/:id', authenticateJWT, checkGroupAdminAccess, async (req, res) => {
  try {
    const travelId = parseInt(req.params.id);
    const success = await deleteTravel(travelId);

    if (!success) {
      return res.status(404).json({ message: '여행을 찾을 수 없습니다.' });
    }

    res.json({ message: '여행이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete travel error:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;