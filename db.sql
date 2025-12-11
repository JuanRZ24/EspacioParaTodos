-- Esquema MySQL para la API de solicitudes
CREATE DATABASE IF NOT EXISTS espacio_publico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE espacio_publico;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user','admin') NOT NULL DEFAULT 'user',
  `token` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `zones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `solicitudes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `zone_id` INT NOT NULL,
  `event_date` DATE NOT NULL,
  `event_start_time` TIME DEFAULT NULL,
  `event_end_time` TIME DEFAULT NULL,
  `duration_hours` INT NOT NULL,
  `justification` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('pending','accepted','rejected','questioned') DEFAULT 'pending',
  `admin_comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`zone_id`) REFERENCES `zones`(`id`) ON DELETE RESTRICT
);


INSERT INTO `zones` (`name`,`description`) VALUES
('Parque Central','Parque principal de la ciudad'),
('Plaza Cultural','Plaza con escenario y zona de exposiciones');

