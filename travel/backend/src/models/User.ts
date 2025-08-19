import pool from '../config/database';

export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
}

export const createUser = async (userData: CreateUserData): Promise<number> => {
  const conn = await pool.getConnection();
  try {
    const result = await conn.query(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [userData.email, userData.password, userData.name]
    );
    return Number(result.insertId);
  } finally {
    conn.release();
  }
};

export const getUserById = async (id: number): Promise<User | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? rows[0] : null;
  } finally {
    conn.release();
  }
};