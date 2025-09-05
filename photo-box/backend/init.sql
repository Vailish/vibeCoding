-- Create wedding events table
CREATE TABLE IF NOT EXISTS wedding_events (
    id SERIAL PRIMARY KEY,
    event_code VARCHAR(20) UNIQUE NOT NULL,
    bride_name VARCHAR(100) NOT NULL,
    groom_name VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    venue VARCHAR(200),
    admin_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create media files table
CREATE TABLE IF NOT EXISTS media_files (
    id SERIAL PRIMARY KEY,
    wedding_event_id INTEGER REFERENCES wedding_events(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) NOT NULL CHECK (file_type IN ('image', 'video')),
    file_size BIGINT NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    uploader_name VARCHAR(100),
    comment TEXT,
    likes_count INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wedding_events_code ON wedding_events(event_code);
CREATE INDEX IF NOT EXISTS idx_media_files_wedding_id ON media_files(wedding_event_id);
CREATE INDEX IF NOT EXISTS idx_media_files_uploaded_at ON media_files(uploaded_at DESC);

-- Insert sample data for testing
INSERT INTO wedding_events (event_code, bride_name, groom_name, event_date, venue, admin_password) 
VALUES ('WED-240905-KJH', '김지혜', '홍길동', '2024-09-05', '서울 웨딩홀', '$2a$10$example.hash.for.testing')
ON CONFLICT (event_code) DO NOTHING;