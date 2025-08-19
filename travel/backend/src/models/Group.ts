import pool from '../config/database';

export interface Group {
  id: number;
  name: string;
  description?: string;
  creator_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  role: 'admin' | 'member';
  joined_at: Date;
}

export interface GroupWithMembers extends Group {
  members: Array<GroupMember & {
    user_name: string;
    user_email: string;
  }>;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export interface InviteMemberRequest {
  user_id: number;
  role?: 'admin' | 'member';
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'member';
}

export const createGroup = async (groupData: CreateGroupRequest, creatorId: number): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    
    const result = await conn.query(
      'INSERT INTO groups (name, description, creator_id) VALUES (?, ?, ?)',
      [groupData.name, groupData.description || null, creatorId]
    );
    
    const groupId = Number(result.insertId);
    
    await conn.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, "admin")',
      [groupId, creatorId]
    );
    
    await conn.commit();
    return groupId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};

export const getGroupsByUserId = async (userId: number): Promise<Group[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT g.* FROM groups g
       INNER JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = ?
       ORDER BY g.created_at DESC`,
      [userId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getGroupById = async (groupId: number): Promise<Group | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM groups WHERE id = ?', [groupId]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};

export const getGroupWithMembers = async (groupId: number): Promise<GroupWithMembers | null> => {
  const conn = await pool.getConnection();
  try {
    const groupRows = await conn.query('SELECT * FROM groups WHERE id = ?', [groupId]);
    if (groupRows.length === 0) return null;
    
    const memberRows = await conn.query(
      `SELECT gm.*, u.name as user_name, u.email as user_email
       FROM group_members gm
       INNER JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.joined_at`,
      [groupId]
    );
    
    return {
      ...groupRows[0],
      members: memberRows
    };
  } finally {
    conn.release();
  }
};

export const updateGroup = async (groupId: number, groupData: UpdateGroupRequest): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const fields = Object.keys(groupData).filter(key => groupData[key as keyof UpdateGroupRequest] !== undefined);
    const values = fields.map(key => groupData[key as keyof UpdateGroupRequest]);
    
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await conn.query(
      `UPDATE groups SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, groupId]
    );
    
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const deleteGroup = async (groupId: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM groups WHERE id = ?', [groupId]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const addMemberToGroup = async (groupId: number, userId: number, role: 'admin' | 'member' = 'member'): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
      [groupId, userId, role]
    );
    return result.affectedRows > 0;
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return false;
    }
    throw error;
  } finally {
    conn.release();
  }
};

export const removeMemberFromGroup = async (groupId: number, userId: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const updateMemberRole = async (groupId: number, userId: number, role: 'admin' | 'member'): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'UPDATE group_members SET role = ? WHERE group_id = ? AND user_id = ?',
      [role, groupId, userId]
    );
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const isUserMemberOfGroup = async (groupId: number, userId: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return rows.length > 0;
  } finally {
    conn.release();
  }
};

export const getUserRoleInGroup = async (groupId: number, userId: number): Promise<'admin' | 'member' | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT role FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return rows.length > 0 ? rows[0].role : null;
  } finally {
    conn.release();
  }
};