CREATE DATABASE IF NOT EXISTS codeyoung_booking
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE codeyoung_booking;

CREATE TABLE IF NOT EXISTS mentors (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  time_zone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  parent_name VARCHAR(120) NOT NULL,
  parent_email VARCHAR(190) NOT NULL,
  parent_time_zone VARCHAR(64) NOT NULL,
  mentor_id BIGINT UNSIGNED NOT NULL,
  mentor_time_zone VARCHAR(64) NOT NULL,
  start_at_utc DATETIME NOT NULL,
  end_at_utc DATETIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  status ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  class_link VARCHAR(500) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_mentor FOREIGN KEY (mentor_id) REFERENCES mentors(id),
  INDEX idx_booking_start (start_at_utc),
  INDEX idx_booking_mentor_start (mentor_id, start_at_utc),
  INDEX idx_booking_parent_email (parent_email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS email_outbox (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNSIGNED NOT NULL,
  recipient_email VARCHAR(190) NOT NULL,
  recipient_role ENUM('parent','mentor') NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  attempts INT UNSIGNED NOT NULL DEFAULT 0,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL,
  CONSTRAINT fk_outbox_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  INDEX idx_outbox_status_created (status, created_at)
) ENGINE=InnoDB;

INSERT IGNORE INTO mentors (name, email, time_zone) VALUES
('Aarav Sharma', 'aarav.mentor@example.com', 'Asia/Kolkata'),
('Diya Patel', 'diya.mentor@example.com', 'Asia/Kolkata'),
('Ishaan Gupta', 'ishaan.mentor@example.com', 'Asia/Kolkata'),
('Ananya Singh', 'ananya.mentor@example.com', 'Asia/Kolkata'),
('Rohan Verma', 'rohan.mentor@example.com', 'Asia/Kolkata'),
('Meera Iyer', 'meera.mentor@example.com', 'Asia/Kolkata'),
('Kabir Das', 'kabir.mentor@example.com', 'Asia/Kolkata'),
('Sara Khan', 'sara.mentor@example.com', 'Asia/Kolkata'),
('Vivaan Rao', 'vivaan.mentor@example.com', 'Asia/Kolkata'),
('Aditi Joshi', 'aditi.mentor@example.com', 'Asia/Kolkata');
