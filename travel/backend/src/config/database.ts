import mariadb from 'mariadb';

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'mariadb',
  user: process.env.DB_USER || 'travel_user',
  password: process.env.DB_PASSWORD || 'travel_password',
  database: process.env.DB_NAME || 'travel_planner',
  connectionLimit: 10,
  acquireTimeout: 60000,
});

export default pool;