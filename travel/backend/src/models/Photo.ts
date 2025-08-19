import pool from '../config/database';

export interface Photo {
  id: number;
  travel_id: number;
  place_id?: number;
  filename: string;
  original_name: string;
  size: number;
  taken_at?: Date;
  latitude?: number;
  longitude?: number;
  caption?: string;
  upload_date: Date;
}

export interface CreatePhotoData {
  travel_id: number;
  place_id?: number;
  filename: string;
  original_name: string;
  size: number;
  taken_at?: Date;
  latitude?: number;
  longitude?: number;
  caption?: string;
}

export const createPhoto = async (photoData: CreatePhotoData): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `INSERT INTO photos (travel_id, place_id, filename, original_name, size, taken_at, latitude, longitude, caption) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photoData.travel_id,
        photoData.place_id || null,
        photoData.filename,
        photoData.original_name,
        photoData.size,
        photoData.taken_at || null,
        photoData.latitude || null,
        photoData.longitude || null,
        photoData.caption || null
      ]
    );
    return Number(result.insertId);
  } finally {
    conn.release();
  }
};

export const getPhotosByTravelId = async (travelId: number): Promise<Photo[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT * FROM photos WHERE travel_id = ? ORDER BY upload_date DESC',
      [travelId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getPhotosByPlaceId = async (placeId: number): Promise<Photo[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT * FROM photos WHERE place_id = ? ORDER BY upload_date DESC',
      [placeId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getPhotoById = async (id: number): Promise<Photo | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM photos WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};

export const updatePhoto = async (id: number, updates: Partial<Photo>): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const fields = Object.keys(updates).filter(key => updates[key as keyof Photo] !== undefined);
    const values = fields.map(key => updates[key as keyof Photo]);
    
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await conn.query(
      `UPDATE photos SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const deletePhoto = async (id: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM photos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};