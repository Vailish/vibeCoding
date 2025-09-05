const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const db = require('../config/database');

const router = express.Router();

// Validation schemas
const createWeddingSchema = Joi.object({
  brideName: Joi.string().min(1).max(100).required(),
  groomName: Joi.string().min(1).max(100).required(),
  eventDate: Joi.date().required(),
  venue: Joi.string().max(200).optional(),
  adminPassword: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  eventCode: Joi.string().required(),
  password: Joi.string().required()
});

// Generate unique event code
function generateEventCode(brideName, groomName, eventDate) {
  const date = new Date(eventDate);
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, '');
  const initials = (brideName[0] + groomName[0]).toUpperCase();
  return `WED-${dateStr}-${initials}`;
}

// Create wedding event
router.post('/wedding/create', async (req, res) => {
  try {
    const { error, value } = createWeddingSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { brideName, groomName, eventDate, venue, adminPassword } = value;
    
    // Generate event code
    const eventCode = generateEventCode(brideName, groomName, eventDate);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Insert into database
    const result = await db.query(
      `INSERT INTO wedding_events 
       (event_code, bride_name, groom_name, event_date, venue, admin_password) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, event_code, bride_name, groom_name, event_date, venue, created_at`,
      [eventCode, brideName, groomName, eventDate, venue, hashedPassword]
    );
    
    res.status(201).json({
      success: true,
      wedding: result.rows[0]
    });
    
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Event code already exists' });
    }
    console.error('Create wedding error:', error);
    res.status(500).json({ error: 'Failed to create wedding event' });
  }
});

// Admin login
router.post('/wedding/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { eventCode, password } = value;
    
    // Get wedding event
    const result = await db.query(
      'SELECT * FROM wedding_events WHERE event_code = $1 AND is_active = true',
      [eventCode]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wedding event not found' });
    }
    
    const wedding = result.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, wedding.admin_password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { weddingId: wedding.id, eventCode: wedding.event_code, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      wedding: {
        id: wedding.id,
        eventCode: wedding.event_code,
        brideName: wedding.bride_name,
        groomName: wedding.groom_name,
        eventDate: wedding.event_date,
        venue: wedding.venue
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get wedding event info (public)
router.get('/wedding/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const result = await db.query(
      `SELECT id, event_code, bride_name, groom_name, event_date, venue 
       FROM wedding_events 
       WHERE event_code = $1 AND is_active = true`,
      [code]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wedding event not found' });
    }
    
    res.json({
      success: true,
      wedding: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get wedding error:', error);
    res.status(500).json({ error: 'Failed to get wedding event' });
  }
});

module.exports = router;