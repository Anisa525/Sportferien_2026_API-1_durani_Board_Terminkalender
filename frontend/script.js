/**
 * Author: Anisa Duraj
 * Date: 05.02.2026
 * Version: 1.0
 * Description: Frontend-Skipt für den Terminkalender
 */

console.log('script.js geladen');
const API_URL = 'http://localhost:3000';

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}

// User erstellen
function createUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
        });
}

// Event erstellen
function createCalendarEvent() {
    console.log('createCalendarEvent wurde geklickt');

    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const start_time = document.getElementById('start_time').value;
    const end_time = document.getElementById('end_time').value;
    const user_id = Number(document.getElementById('user_id').value);

    fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, start_time, end_time, user_id })
    })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => console.error(err));
}


// Alle Events laden
function loadEvents() {
    fetch(`${API_URL}/events/all`)
        .then(res => res.json())
        .then(events => {
            const list = document.getElementById('eventList');
            list.innerHTML = '';

            events.forEach(event => {
                const li = document.createElement('li');
                li.textContent =
                    `${event.pk_id} - ${formatDate(event.date)} | ${event.start_time}-${event.end_time} | ${event.title} | (${event.username || 'kein User'})`;
                list.appendChild(li);
            });
        });
}

function loadUsers() {
    fetch(`${API_URL}/users`)
        .then(res => res.json())
        .then(users => {
            const list = document.getElementById('userList');
            list.innerHTML = '';
            users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `ID: ${user.user_id}, Username: ${user.username}`;
                list.appendChild(li);
            });
        });
}

function updateEvent() {
    const eventId = document.getElementById('pk_id').value;

    // Optional: nur Felder senden, die gefüllt sind
    const payload = {};
    if (document.getElementById('new_title').value) payload.title = document.getElementById('new_title').value;
    if (document.getElementById('new_date').value) payload.date = document.getElementById('new_date').value;
    if (document.getElementById('new_start_time').value) payload.start_time = document.getElementById('new_start_time').value;
    if (document.getElementById('new_end_time').value) payload.end_time = document.getElementById('new_end_time').value;
    if (document.getElementById('new_user_id').value) payload.user_id = Number(document.getElementById('new_user_id').value);


    fetch(`${API_URL}/events/${eventId}`, { // ID in URL einfügen
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })

        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadEvents();
        })
        .catch(err => console.error(err));
}

function updateUser() {
    const userId = document.getElementById('user_id').value;

    // Optional: nur Felder senden, die gefüllt sind
    const payload = {};
    if (document.getElementById('new_username').value)
        payload.username = document.getElementById('new_username').value;

    if (document.getElementById('new_password').value)
        payload.password = document.getElementById('new_password').value;

    fetch(`${API_URL}/users/${userId}`, { // ID in URL einfügen
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadUsers(); // Falls du eine User-Liste neu laden willst
        })
        .catch(err => console.error(err));
}

function deleteUser() {
    const userId = document.getElementById('user_id_delete').value;

    if (!userId) {
        alert('Bitte eine User-ID eingeben!');
        return;
    }

    fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
    })
        .then(res => res.json())
        .then(data => {
            // Wenn das Backend meldet, dass noch Aufgaben bestehen
            if (data.message.includes('noch eine Aufgabe')) {
                alert(data.message); // z. B. "Dieser User kann nicht gelöscht werden! Er hat noch eine Aufgabe."
            } else {
                // Erfolgreiches Löschen
                alert(data.message);
                loadUsers(); // Optional: User-Liste neu laden
            }
        })
        .catch(err => console.error('Fehler beim Löschen des Users:', err));
}

function deleteEvent() {
    const eventId = document.getElementById('event_id_delete').value;

    if (!eventId) {
        alert('Bitte eine Event-ID eingeben!');
        return;
    }

    fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        // User-ID nur nötig, falls Backend prüft, ob der aktuelle User der Besitzer ist
        body: JSON.stringify({ user_id: Number(document.getElementById('event_user_id_delete').value) })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadEvents(); // Optional: Event-Liste neu laden
        })
        .catch(err => console.error('Fehler beim Löschen des Events:', err));
}

// Dark Mode persistent machen
// ===== Dark Mode persistent machen =====
const body = document.body;
const darkModeToggle = document.getElementById('toggle-mode');

// Prüfen, ob Dark Mode schon gespeichert ist
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    darkModeToggle.textContent = 'Light Mode';
}

// Toggle-Funktion
darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // speichern, wenn Dark Mode an/aus
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        darkModeToggle.textContent = 'Light Mode';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        darkModeToggle.textContent = 'Dark Mode';
    }
});


