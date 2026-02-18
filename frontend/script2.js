/**
 * Author: Anisa Duraj
 * Date: 05.02.2026
 * Version: 1.0
 * Description: Frontend-Skipt für den Terminkalender
 */

console.log('script.js geladen');

const API_URL = 'http://localhost:3000';

// ---------- Hilfsfunktionen ----------
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
}

function formatTime(timeString) {
    return timeString.slice(0, 5);
}

// ---------- User erstellen ----------
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

// ---------- Event erstellen ----------
function createCalendarEvent() {
    console.log('createCalendarEvent wurde geklickt');

    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const start_time = document.getElementById('start_time').value;
    const end_time = document.getElementById('end_time').value;
    const user_id = Number(document.getElementById('user_id').value);

    fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, date, start_time, end_time, user_id })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadEvents();
        })
        .catch(err => console.error(err));
}

// ---------- Alle Events laden ----------
function loadEvents() {
    fetch(`${API_URL}/events/all`)
        .then(res => res.json())
        .then(events => {
            const list = document.getElementById('eventList');
            list.innerHTML = '';

            events.forEach(event => {
                const li = document.createElement('li');
                li.textContent =
                    `${formatDate(event.date)} ` +
                    `${formatTime(event.start_time)}-${formatTime(event.end_time)} | ` +
                    `${event.title} (${event.username || 'kein User'})`;
                list.appendChild(li);
            });
        });
}

// ---------- Alle User laden ----------
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

// ---------- Event aktualisieren ----------
function updateEvent() {
    const eventId = document.getElementById('pk_id').value;

    fetch(`${API_URL}/events`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById('title').value,
            date: document.getElementById('date').value,
            start_time: document.getElementById('start_time').value,
            end_time: document.getElementById('end_time').value,
            user_id: Number(document.getElementById('user_id').value)
        })
    })
        .then(res => res.json())
        .then(data => {
            alert(data.message);
            loadEvents();
        });
}
