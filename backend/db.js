/**
 * Author: Anisa Duraj
 * Date: 04.02.2026 
 * Version: 2.0 
 * Description: Datenbankverbindung für den Terminkalender 
 */

const mysql = require('mysql2');

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',           
    password: 'anisa123',
    database: 'calendar_db'
});

// Test connection
db.connect(err => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

module.exports = db;
