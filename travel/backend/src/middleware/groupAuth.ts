import { Request, Response, NextFunction } from 'express';
import { isUserMemberOfGroup, getUserRoleInGroup } from '../models/Group';
import { getTravelById } from '../models/Travel';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const checkGroupAccess = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const travelId = parseInt(req.params.id || req.params.travelId);
    if (isNaN(travelId)) {
      return res.status(400).json({ error: 'Invalid travel ID' });
    }

    const travel = await getTravelById(travelId);
    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    if (travel.user_id === userId) {
      return next();
    }

    if (travel.group_id) {
      const isMember = await isUserMemberOfGroup(travel.group_id, userId);
      if (isMember) {
        return next();
      }
    }

    return res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    console.error('Group access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkGroupAdminAccess = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const travelId = parseInt(req.params.id || req.params.travelId);
    if (isNaN(travelId)) {
      return res.status(400).json({ error: 'Invalid travel ID' });
    }

    const travel = await getTravelById(travelId);
    if (!travel) {
      return res.status(404).json({ error: 'Travel not found' });
    }

    if (travel.user_id === userId) {
      return next();
    }

    if (travel.group_id) {
      const userRole = await getUserRoleInGroup(travel.group_id, userId);
      if (userRole === 'admin') {
        return next();
      }
    }

    return res.status(403).json({ error: 'Admin access required' });
  } catch (error) {
    console.error('Group admin access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};