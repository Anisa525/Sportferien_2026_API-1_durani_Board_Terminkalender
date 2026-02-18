/**
 * Author: Anisa Duraj
 * Date: 05.02.2026
 * Version: 1.0 
 * Description: Backend-Server für den Terminkalender
 */

const express = require('express');
const cors = require('cors');
const app = express();
const db_terminkalender = require('./db');


app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Backend is running');
});

// Server starten
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

// Alle Termine abrufen, inklusive Benutzerinformationen
app.get('/events/all', (req, res) => {
    // SQL-Abfrage, um alle Termine mit den zugehörigen Benutzernamen abzurufen
    const sql = `
        SELECT e.pk_id, e.title, e.date, e.start_time, e.end_time,
               u.user_id, u.username
        FROM events e
        LEFT JOIN users u ON e.user_id = u.user_id
        ORDER BY e.date, e.start_time
    `;
    // Führt die SQL-Abfrage aus und senden Sie die Ergebnisse als JSON zurück oder gibt einen Fehler zurück, wenn die Abfrage fehlschlägt
    db_terminkalender.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Termine für einen bestimmten Benutzer abrufen
app.get('/events/:user_id', (req, res) => {
    // SQL-Abfrage, um alle Termine für einen bestimmten Benutzer abzurufen
    const sql = 'SELECT * FROM events WHERE user_id = ?';
    // Führt die SQL-Abfrage aus und senden Sie die Ergebnisse als JSON zurück oder gibt einen Fehler zurück, wenn die Abfrage fehlschlägt
    db_terminkalender.query(sql, [req.params.user_id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }
        res.json(results);
    });
});

// Alle Benutzer abrufen (ohne Passwörter)
app.get('/users', (req, res) => {
    // SQL-Abfrage, um alle Benutzer abzurufen, aber nur die Benutzer-ID und den Benutzernamen zurückzugeben Passwörter werden nicht zurückgegeben, um die Sicherheit zu gewährleisten
    const sql = 'SELECT user_id, username FROM users';
    // Führt die SQL-Abfrage aus und senden Sie die Ergebnisse als JSON zurück oder gibt einen Fehler zurück, wenn die Abfrage fehlschlägt
    db_terminkalender.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        res.json(results);
    });
});

// Neuen Benutzer erstellen
app.post('/user', (req, res) => {
    const { username, password } = req.body;
    // SQL-Abfrage, um einen neuen Benutzer in die Datenbank einzufügen. Es werden der Benutzername und das Passwort als Parameter übergeben, um SQL-Injection zu verhindern
    const sql = `
        INSERT INTO users (username, password)
        VALUES (?, ?)
    `;
    // Führt die SQL-Abfrage aus und sendet eine Erfolgsmeldung mit der ID des neu erstellten Benutzers zurück oder gibt einen Fehler zurück, wenn die Abfrage fehlschlägt
    db_terminkalender.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }

        res.json({ message: 'User created successfully', userId: result.insertId });
    });
});

// Neuen Termin erstellen
app.post('/events', (req, res) => {
    const { title, date, start_time, end_time, user_id } = req.body;
    // SQL-Abfrage, um einen neuen Termin in die Datenbank einzufügen. Es werden die Termindetails und die Benutzer-ID als Parameter übergeben, um SQL-Injection zu verhindern
    const sql = `
        INSERT INTO events (title, date, start_time, end_time, user_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    // Führt die SQL-Abfrage aus und sendet eine Erfolgsmeldung mit der ID des neu erstellten Termins zurück oder gibt einen Fehler zurück, wenn die Abfrage fehlschlägt
    db_terminkalender.query(sql, [title, date, start_time, end_time, user_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        res.json({ message: 'Event saved successfully', eventId: result.insertId });
    });
});

// Termin löschen
app.delete('/events/:id', (req, res) => {
    const eventId = req.params.id;
    // SQL-Abfrage, um einen Termin aus der Datenbank zu löschen. Es werden die Termin-ID und die Benutzer-ID als Parameter übergeben, um sicherzustellen, dass nur der Besitzer des Termins diesen löschen kann
    const sql = 'DELETE FROM events WHERE pk_id = ? and user_id = ?';
    // Führt die SQL-Abfrage aus und sendet eine Erfolgsmeldung zurück, wenn der Termin erfolgreich gelöscht wurde, oder gibt einen Fehler zurück, wenn die Abfrage fehlschlägt oder der Termin nicht gefunden wird
    db_terminkalender.query(sql, [eventId, req.body.user_id], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Event not found' });
            return;
        }

        res.json({ message: 'Event deleted successfully' });
    });
});

// Termin aktualisieren (nur die Felder, die im Request-Body angegeben sind, werden aktualisiert)
// Termin aktualisieren
app.put('/events/:id', (req, res) => {

    // Liest die Termin-ID aus der URL
    const eventId = req.params.id;

    // Liest die neuen Termindaten aus dem Request-Body
    const { title, date, start_time, end_time, user_id } = req.body;

    // SQL-Abfrage, um zu prüfen, ob der Termin mit der angegebenen ID existiert
    const sqlSelect = 'SELECT * FROM events WHERE pk_id = ?';

    // Führt die SELECT-Abfrage aus
    db_terminkalender.query(sqlSelect, [eventId], (err, results) => {

        // Gibt einen Serverfehler zurück, falls die Datenbankabfrage fehlschlägt
        if (err) return res.status(500).json({ error: err });

        // Gibt einen 404-Fehler zurück, falls kein Termin mit dieser ID existiert
        if (results.length === 0)
            return res.status(404).json({ message: 'Event not found' });

        // Speichert die bestehenden Termindaten
        const event = results[0];

        // Verwendet neue Werte, falls vorhanden, sonst die bestehenden Daten
        const updatedTitle = title || event.title;
        const updatedDate = date || event.date;
        const updatedStartTime = start_time || event.start_time;
        const updatedEndTime = end_time || event.end_time;

        // Aktualisiert die Benutzer-ID nur, wenn sie explizit übergeben wurde
        const updatedUserId = user_id !== undefined ? user_id : event.user_id;

        // SQL-Abfrage, um den Termin in der Datenbank zu aktualisieren
        const sqlUpdate = `
            UPDATE events
            SET title = ?, date = ?, start_time = ?, end_time = ?, user_id = ?
            WHERE pk_id = ?
        `;

        // Führt die UPDATE-Abfrage aus und aktualisiert den Termin
        db_terminkalender.query(
            sqlUpdate,
            [updatedTitle, updatedDate, updatedStartTime, updatedEndTime, updatedUserId, eventId],
            (err, result) => {

                // Gibt einen Fehler zurück, falls das Update fehlschlägt
                if (err) {
                    res.status(500).json({ error: err });
                    return;
                }

                // Sendet eine Erfolgsmeldung zurück, wenn der Termin erfolgreich aktualisiert wurde
                res.json({ message: 'Event erfolgreich aktualisiert' });
            }
        );
    });
});

// Benutzer aktualisieren
app.put('/users/:id', (req, res) => {
    // Liest die Benutzer-ID aus der URL
    const userId = req.params.id;

    // Liest neue Benutzerdaten aus dem Request-Body
    const { username, password } = req.body;

    // Prüfen, ob der User existiert
    const sqlSelect = 'SELECT * FROM users WHERE user_id = ?';
    db_terminkalender.query(sqlSelect, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0)
            return res.status(404).json({ message: 'User not found' });

        const user = results[0];

        // Neue Werte oder alte beibehalten
        const updatedUsername = username || user.username;
        const updatedPassword = password || user.password;

        // SQL-Abfrage nur für username und password
        const sqlUpdate = `
            UPDATE users
            SET username = ?, password = ?
            WHERE user_id = ?
        `;

        // UPDATE ausführen
        db_terminkalender.query(
            sqlUpdate,
            [updatedUsername, updatedPassword, userId],
            (err, result) => {
                if (err) return res.status(500).json({ error: err });

                // Prüfen, ob wirklich eine Zeile geändert wurde
                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: 'User not found or no changes made' });
                }

                res.json({ message: 'User erfolgreich aktualisiert' });
            }
        );
    });
});

// Benutzer löschen
app.delete('/users/:id', (req, res) => {

    // Liest die Benutzer-ID aus der URL (z. B. /users/4)
    const userId = req.params.id;

    // SQL-Abfrage, um den Benutzer aus der Datenbank zu löschen
    const sql = 'DELETE FROM users WHERE user_id = ?';

    // Führt die DELETE-Abfrage aus
    db_terminkalender.query(sql, [userId], (err, result) => {
        if (err) {
            res.status(500).json({ error: err });
            return;
        }

        // Falls kein Benutzer gelöscht wurde (ID existiert nicht)
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Sendet eine Erfolgsmeldung zurück
        res.json({ message: 'User deleted successfully' });
    });
});