import express from 'express';
import passport from 'passport';
import {
  createGroup,
  getGroupsByUserId,
  getGroupById,
  getGroupWithMembers,
  updateGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  updateMemberRole,
  isUserMemberOfGroup,
  getUserRoleInGroup,
  CreateGroupRequest,
  UpdateGroupRequest,
  InviteMemberRequest,
  UpdateMemberRoleRequest
} from '../models/Group';

const router = express.Router();

// JWT 인증 미들웨어
const authenticateJWT = passport.authenticate('jwt', { session: false });

router.get('/', authenticateJWT, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const groups = await getGroupsByUserId(userId);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const groupId = parseInt(req.params.id);

    if (!userId || isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const isMember = await isUserMemberOfGroup(groupId, userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const group = await getGroupWithMembers(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateJWT, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const groupData: CreateGroupRequest = req.body;
    
    if (!groupData.name || groupData.name.trim().length === 0) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    const groupId = await createGroup(groupData, userId);
    const newGroup = await getGroupWithMembers(groupId);

    res.status(201).json(newGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const groupId = parseInt(req.params.id);

    if (!userId || isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const userRole = await getUserRoleInGroup(groupId, userId);
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const updateData: UpdateGroupRequest = req.body;
    const success = await updateGroup(groupId, updateData);

    if (!success) {
      return res.status(404).json({ error: 'Group not found or no changes made' });
    }

    const updatedGroup = await getGroupWithMembers(groupId);
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const groupId = parseInt(req.params.id);

    if (!userId || isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const group = await getGroupById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creator_id !== userId) {
      return res.status(403).json({ error: 'Only group creator can delete the group' });
    }

    const success = await deleteGroup(groupId);
    if (!success) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/members', authenticateJWT, async (req, res) => {
  try {
    const userId = (req.user as any)?.id;
    const groupId = parseInt(req.params.id);

    if (!userId || isNaN(groupId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const userRole = await getUserRoleInGroup(groupId, userId);
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { user_id, role = 'member' }: InviteMemberRequest = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const success = await addMemberToGroup(groupId, user_id, role);
    if (!success) {
      return res.status(400).json({ error: 'User is already a member or invalid user' });
    }

    const updatedGroup = await getGroupWithMembers(groupId);
    res.status(201).json(updatedGroup);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id/members/:userId', authenticateJWT, async (req, res) => {
  try {
    const currentUserId = (req.user as any)?.id;
    const groupId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);

    if (!currentUserId || isNaN(groupId) || isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const currentUserRole = await getUserRoleInGroup(groupId, currentUserId);
    
    if (currentUserId !== targetUserId && currentUserRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required or can only remove yourself' });
    }

    const success = await removeMemberFromGroup(groupId, targetUserId);
    if (!success) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error removing member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/members/:userId/role', authenticateJWT, async (req, res) => {
  try {
    const currentUserId = (req.user as any)?.id;
    const groupId = parseInt(req.params.id);
    const targetUserId = parseInt(req.params.userId);

    if (!currentUserId || isNaN(groupId) || isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    const currentUserRole = await getUserRoleInGroup(groupId, currentUserId);
    if (currentUserRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { role }: UpdateMemberRoleRequest = req.body;
    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ error: 'Valid role is required (admin or member)' });
    }

    const success = await updateMemberRole(groupId, targetUserId, role);
    if (!success) {
      return res.status(404).json({ error: 'Member not found in group' });
    }

    const updatedGroup = await getGroupWithMembers(groupId);
    res.json(updatedGroup);
  } catch (error) {
    console.error('Error updating member role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;