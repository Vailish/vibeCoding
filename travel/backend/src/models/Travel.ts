import pool from '../config/database';

export interface Travel {
  id: number;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  status: 'planning' | 'ongoing' | 'completed';
  budget: number;
  cover_image?: string;
  user_id: number;
  group_id?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTravelData {
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  budget?: number;
  user_id: number;
  group_id?: number;
}

export const createTravel = async (travelData: CreateTravelData): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'INSERT INTO travels (title, description, start_date, end_date, budget, user_id, group_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [travelData.title, travelData.description, travelData.start_date, travelData.end_date, travelData.budget || 0, travelData.user_id, travelData.group_id || null]
    );
    return Number(result.insertId);
  } finally {
    conn.release();
  }
};

export const getTravelsByUserId = async (userId: number): Promise<Travel[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT t.* FROM travels t
       LEFT JOIN group_members gm ON t.group_id = gm.group_id
       WHERE t.user_id = ? OR (t.group_id IS NOT NULL AND gm.user_id = ?)
       ORDER BY t.created_at DESC`,
      [userId, userId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getTravelById = async (id: number): Promise<Travel | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM travels WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};

export const updateTravel = async (id: number, travelData: Partial<Travel>): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const fields = Object.keys(travelData).filter(key => travelData[key as keyof Travel] !== undefined);
    const values = fields.map(key => travelData[key as keyof Travel]);
    
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await conn.query(
      `UPDATE travels SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const deleteTravel = async (id: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM travels WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};