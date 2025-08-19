import pool from '../config/database';

export interface Place {
  id: number;
  name: string;
  address?: string;
  category: 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity';
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  operating_hours?: string;
  average_cost?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePlaceData {
  name: string;
  address?: string;
  category: 'attraction' | 'restaurant' | 'accommodation' | 'shopping' | 'activity';
  latitude?: number;
  longitude?: number;
  phone?: string;
  website?: string;
  operating_hours?: string;
  average_cost?: number;
}

export const createPlace = async (placeData: CreatePlaceData): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `INSERT INTO places (name, address, category, latitude, longitude, phone, website, operating_hours, average_cost) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        placeData.name,
        placeData.address || null,
        placeData.category,
        placeData.latitude || null,
        placeData.longitude || null,
        placeData.phone || null,
        placeData.website || null,
        placeData.operating_hours || null,
        placeData.average_cost || null
      ]
    );
    return Number(result.insertId);
  } finally {
    conn.release();
  }
};

export const getAllPlaces = async (): Promise<Place[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM places ORDER BY name');
    return rows;
  } finally {
    conn.release();
  }
};

export const getPlaceById = async (id: number): Promise<Place | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM places WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};

export const searchPlaces = async (query: string): Promise<Place[]> => {
  const conn = await pool.getConnection();
  try {
    const searchQuery = `%${query}%`;
    const rows = await conn.query(
      'SELECT * FROM places WHERE name LIKE ? OR address LIKE ? ORDER BY name LIMIT 20',
      [searchQuery, searchQuery]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const updatePlace = async (id: number, updates: Partial<Place>): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const fields = Object.keys(updates).filter(key => updates[key as keyof Place] !== undefined);
    const values = fields.map(key => updates[key as keyof Place]);
    
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await conn.query(
      `UPDATE places SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const deletePlace = async (id: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM places WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};