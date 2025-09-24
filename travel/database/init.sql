-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS travel_planner;
USE travel_planner;

-- 사용자 테이블
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 그룹 테이블
CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 그룹 멤버 테이블
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    role ENUM('admin', 'member') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_user (group_id, user_id)
);

-- 여행 테이블
CREATE TABLE travels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('planning', 'ongoing', 'completed') DEFAULT 'planning',
    budget DECIMAL(10,2) DEFAULT 0,
    cover_image VARCHAR(500),
    user_id INT NOT NULL,
    group_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

-- 장소 테이블
CREATE TABLE places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    category ENUM('attraction', 'restaurant', 'accommodation', 'shopping', 'activity') DEFAULT 'attraction',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    website VARCHAR(500),
    operating_hours TEXT,
    average_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 일정 테이블
CREATE TABLE itineraries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    travel_id INT NOT NULL,
    date DATE NOT NULL,
    order_index INT DEFAULT 0,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIME,
    end_time TIME,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    actual_cost DECIMAL(10,2) DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location_name VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (travel_id) REFERENCES travels(id) ON DELETE CASCADE
);

-- 일정-장소 연결 테이블
CREATE TABLE itinerary_places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    itinerary_id INT NOT NULL,
    place_id INT NOT NULL,
    order_index INT DEFAULT 0,
    arrival_time TIME,
    departure_time TIME,
    actual_cost DECIMAL(10,2),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (itinerary_id) REFERENCES itineraries(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
);

-- 사진 테이블
CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    travel_id INT NOT NULL,
    place_id INT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    size INT,
    taken_at TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    caption TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (travel_id) REFERENCES travels(id) ON DELETE CASCADE,
    FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX idx_groups_creator_id ON groups(creator_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_travels_user_id ON travels(user_id);
CREATE INDEX idx_travels_group_id ON travels(group_id);
CREATE INDEX idx_itineraries_travel_id ON itineraries(travel_id);
CREATE INDEX idx_itinerary_places_itinerary_id ON itinerary_places(itinerary_id);
CREATE INDEX idx_itinerary_places_place_id ON itinerary_places(place_id);
CREATE INDEX idx_photos_travel_id ON photos(travel_id);
CREATE INDEX idx_photos_place_id ON photos(place_id);

-- 샘플 데이터 삽입 (테스트용)
INSERT INTO users (email, password, name) VALUES 
('test@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewUGPaVy8oXM0J/K', '테스트 사용자');

INSERT INTO travels (title, description, start_date, end_date, status, budget, user_id) VALUES 
('제주도 여행', '가족과 함께하는 제주도 3박 4일 여행', '2024-08-01', '2024-08-04', 'planning', 500000, 1),
('일본 도쿄 여행', '친구들과 함께하는 도쿄 여행', '2024-09-15', '2024-09-20', 'planning', 800000, 1);

INSERT INTO places (name, address, category, latitude, longitude) VALUES 
('성산일출봉', '제주특별자치도 서귀포시 성산읍 성산리', 'attraction', 33.4580, 126.9422),
('한라산', '제주특별자치도 제주시 해안동', 'attraction', 33.3617, 126.5292),
('도쿄 스카이트리', '일본 도쿄도 스미다구 오시아게', 'attraction', 35.7101, 139.8107);