// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./database.js');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// --- API Endpoints ---

// This is the main endpoint to get ALL data. It's now more efficient.
app.get("/api/data", (req, res) => {
    const data = {};
    const q1 = new Promise((resolve, reject) => db.all("SELECT * FROM income ORDER BY date DESC", [], (e, r) => e ? reject(e) : resolve(r)));
    const q2 = new Promise((resolve, reject) => db.all("SELECT * FROM expenses ORDER BY date DESC", [], (e, r) => e ? reject(e) : resolve(r)));
    
    // NEW: This query fetches projects AND nests all their tasks inside a JSON array.
    const projectSql = `
        SELECT p.*,
               (SELECT json_group_array(json_object('id', pt.id, 'description', pt.description, 'status', pt.status))
                FROM project_tasks pt WHERE pt.project_id = p.id ORDER BY pt.id) as tasks
        FROM projects p ORDER BY p.id DESC;
    `;
    const q3 = new Promise((resolve, reject) => db.all(projectSql, [], (e, rows) => {
        if (e) return reject(e);
        // The 'tasks' column is a JSON string, so we need to parse it.
        rows.forEach(row => {
            row.tasks = row.tasks ? JSON.parse(row.tasks) : [];
        });
        resolve(rows);
    }));

    Promise.all([q1, q2, q3]).then(([income, expenses, projects]) => {
        res.json({ income, expenses, projects });
    }).catch(err => res.status(400).json({ "error": err.message }));
});

// --- Existing Endpoints (No Changes Here) ---
app.post("/api/income", (req, res) => {
    const { source, amount, date } = req.body;
    db.run(`INSERT INTO income (source, amount, date) VALUES (?,?,?)`, [source, amount, date], function (e) {
        e ? res.status(400).json({ "error": e.message }) : res.json({ id: this.lastID });
    });
});

app.post("/api/expenses", (req, res) => {
    const { description, amount, date } = req.body;
    db.run(`INSERT INTO expenses (description, amount, date) VALUES (?,?,?)`, [description, amount, date], function (e) {
        e ? res.status(400).json({ "error": e.message }) : res.json({ id: this.lastID });
    });
});

app.post("/api/projects", (req, res) => {
    const { name, goal } = req.body;
    db.run(`INSERT INTO projects (name, goal, saved) VALUES (?,?,0)`, [name, goal], function (e) {
        e ? res.status(400).json({ "error": e.message }) : res.json({ id: this.lastID });
    });
});

app.post("/api/projects/save", (req, res) => {
    const { projectId, amount } = req.body;
    db.run(`UPDATE projects SET saved = saved + ? WHERE id = ?`, [amount, projectId], function (e) {
        e ? res.status(400).json({ "error": e.message }) : res.json({ changes: this.changes });
    });
});
// --- End of Existing Endpoints ---


// --- NEW Task Management Endpoints ---
app.post("/api/tasks", (req, res) => {
    const { projectId, description } = req.body;
    db.run(`INSERT INTO project_tasks (project_id, description) VALUES (?,?)`, [projectId, description], function (e) {
        e ? res.status(400).json({ "error": e.message }) : res.json({ id: this.lastID });
    });
});

app.put("/api/tasks/:id", (req, res) => {
    const { status } = req.body;
    db.run(`UPDATE project_tasks SET status = ? WHERE id = ?`, [status, req.params.id], function (e) {
        e ? res.status(400).json({ "error": e.message }) : res.json({ changes: this.changes });
    });
});


// --- Email Reminders (No changes here) ---
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } });
const sendReminder = (timeOfDay) => {
    const mailOptions = { from: process.env.EMAIL_USER, to: process.env.EMAIL_RECIPIENT, subject: `${timeOfDay} Fin-Quest Reminder ⚔️`, text: `Greetings, Adventurer! Your ${timeOfDay.toLowerCase()} quest awaits. Log your finances and check your mission progress! http://localhost:5173` };
    transporter.sendMail(mailOptions, (err, info) => { if (err) { console.log("Nodemailer Error:", err); } else { console.log(`${timeOfDay} email sent: ` + info.response); } });
};
cron.schedule('0 9 * * *', () => sendReminder('Morning'), { timezone: "Africa/Lagos"}); 
cron.schedule('0 20 * * *', () => sendReminder('Evening'), { timezone: "Africa/Lagos"});