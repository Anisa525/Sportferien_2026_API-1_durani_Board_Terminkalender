/**
 * Author: Anisa Duraj
 * Date: 05.02.2026
 * Version: 1.1
 * Description: Backend-Server für den Terminkalender
 */

const express = require('express');
const cors = require('cors');
const app = express();
const db_terminkalender = require('./db');

// Middleware
app.use(express.json());
app.use(cors());
    
// Test route
app.get('/', (req, res) => {
    res.send('Backend is running');
});

// GET: Alle Events
app.get('/events', (req, res) => {
    const sql = 'SELECT * FROM events';

    db_terminkalender.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err });
        }
        res.json(results);
    });
});

// POST: Neues Event
app.post('/events', (req, res) => {
    const { title, date, start_time, end_time, user_id } = req.body;

    const sql = `
        INSERT INTO events (title, date, start_time, end_time, user_id)
        VALUES (?, ?, ?, ?, ?)
    `;

    db_terminkalender.query(
        sql,
        [title, date, start_time, end_time, user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            res.json({
                message: 'Event saved successfully',
                eventId: result.insertId
            });
        }
    );
});

// DELETE: Event löschen
app.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;

    const sql = 'DELETE FROM events WHERE pk_id = ?';

    db_terminkalender.query(sql, [eventId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });
    });
});

// PUT: Event bearbeiten
app.put('/events/:id', (req, res) => {
    const eventId = req.params.id;
    const { title, date, start_time, end_time } = req.body;

    const sql = `
        UPDATE events
        SET title = ?, date = ?, start_time = ?, end_time = ?
        WHERE pk_id = ?
    `;

    db_terminkalender.query(
        sql,
        [title, date, start_time, end_time, eventId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Event not found' });
            }

            res.json({ message: 'Event updated successfully' });
        }
    );
});

// Server start
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
