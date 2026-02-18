/*
Author:Anisa Duraj
Date: 03.02.2026
Version: 3.0
Description: Datenbank-Skript für den Terminkalender
*/

DROP DATABASE IF EXISTS calendar_db;
CREATE DATABASE calendar_db;
USE calendar_db;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE events (
    pk_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

SELECT 
    e.pk_id, e.title, e.date, e.start_time, e.end_time,
    u.user_id, u.username
FROM events e
LEFT JOIN users u ON e.user_id = u.user_id
ORDER BY e.date, e.start_time;

SELECT * FROM events;
SELECT * FROM users;
