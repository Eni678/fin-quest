// backend/database.js
const sqlite3 = require('sqlite3').verbose();
const DB_SOURCE = "finquest.db";

const db = new sqlite3.Database(DB_SOURCE, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
        const sql = `
        CREATE TABLE IF NOT EXISTS income (
            id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT, amount REAL, date TEXT
        );
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT, description TEXT, amount REAL, date TEXT
        );
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, goal REAL, saved REAL DEFAULT 0
        );
        CREATE TABLE IF NOT EXISTS project_tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'todo',
            FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
        );
        `;
        db.exec(sql, (err) => {
            if (err) console.error("Error creating tables:", err);
        });
    }
});

module.exports = db;