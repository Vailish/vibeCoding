import pool from '../config/database';

export interface Itinerary {
  id: number;
  travel_id: number;
  date: Date;
  order_index: number;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost: number;
  actual_cost: number;
  is_completed: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateItineraryData {
  travel_id: number;
  date: Date;
  order_index?: number;
  title: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost?: number;
  actual_cost?: number;
  is_completed?: boolean;
  notes?: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
}

export interface ItineraryPlace {
  id: number;
  itinerary_id: number;
  place_id: number;
  order_index: number;
  arrival_time?: string;
  departure_time?: string;
  actual_cost?: number;
  rating?: number;
  review?: string;
  place: {
    id: number;
    name: string;
    address?: string;
    category: string;
    latitude?: number;
    longitude?: number;
  };
}

export const createItinerary = async (itineraryData: CreateItineraryData): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      `INSERT INTO itineraries (travel_id, date, order_index, title, description, start_time, end_time, estimated_cost, actual_cost, is_completed, notes, latitude, longitude, location_name) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        itineraryData.travel_id,
        itineraryData.date,
        itineraryData.order_index || 0,
        itineraryData.title,
        itineraryData.description || null,
        itineraryData.start_time === '' ? null : itineraryData.start_time || null,
        itineraryData.end_time === '' ? null : itineraryData.end_time || null,
        itineraryData.estimated_cost || 0,
        itineraryData.actual_cost || 0,
        itineraryData.is_completed || false,
        itineraryData.notes || null,
        itineraryData.latitude || null,
        itineraryData.longitude || null,
        itineraryData.location_name || null
      ]
    );
    return Number(result.insertId);
  } finally {
    conn.release();
  }
};

export const getItinerariesByTravelId = async (travelId: number): Promise<Itinerary[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      'SELECT * FROM itineraries WHERE travel_id = ? ORDER BY date, order_index',
      [travelId]
    );
    return rows;
  } finally {
    conn.release();
  }
};

export const getItineraryById = async (id: number): Promise<Itinerary | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM itineraries WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};

export const updateItinerary = async (id: number, updates: Partial<Itinerary>): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const fields = Object.keys(updates).filter(key => updates[key as keyof Itinerary] !== undefined);
    const values = fields.map(key => {
      const value = updates[key as keyof Itinerary];
      // 시간 필드의 빈 문자열을 NULL로 변환
      if ((key === 'start_time' || key === 'end_time') && value === '') {
        return null;
      }
      return value;
    });
    
    if (fields.length === 0) return false;
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const result = await conn.query(
      `UPDATE itineraries SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
    
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

export const deleteItinerary = async (id: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM itineraries WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};

// 일정-장소 연결 관리
export const addPlaceToItinerary = async (
  itineraryId: number,
  placeId: number,
  orderIndex: number = 0,
  arrivalTime?: string,
  departureTime?: string
): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'INSERT INTO itinerary_places (itinerary_id, place_id, order_index, arrival_time, departure_time) VALUES (?, ?, ?, ?, ?)',
      [itineraryId, placeId, orderIndex, arrivalTime || null, departureTime || null]
    );
    return Number(result.insertId);
  } finally {
    conn.release();
  }
};

export const getItineraryPlaces = async (itineraryId: number): Promise<ItineraryPlace[]> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      `SELECT ip.*, p.name, p.address, p.category, p.latitude, p.longitude
       FROM itinerary_places ip
       JOIN places p ON ip.place_id = p.id
       WHERE ip.itinerary_id = ?
       ORDER BY ip.order_index`,
      [itineraryId]
    );
    
    return rows.map((row: any) => ({
      id: row.id,
      itinerary_id: row.itinerary_id,
      place_id: row.place_id,
      order_index: row.order_index,
      arrival_time: row.arrival_time,
      departure_time: row.departure_time,
      actual_cost: row.actual_cost,
      rating: row.rating,
      review: row.review,
      place: {
        id: row.place_id,
        name: row.name,
        address: row.address,
        category: row.category,
        latitude: row.latitude,
        longitude: row.longitude
      }
    }));
  } finally {
    conn.release();
  }
};

export const removePlaceFromItinerary = async (itineraryPlaceId: number): Promise<boolean> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query('DELETE FROM itinerary_places WHERE id = ?', [itineraryPlaceId]);
    return result.affectedRows > 0;
  } finally {
    conn.release();
  }
};