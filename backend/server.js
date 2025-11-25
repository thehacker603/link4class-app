const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ================== REGISTRAZIONE ==================
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!email || !password || !username)
    return res.status(400).json({ message: "Dati mancanti" });

  const hashed = await bcrypt.hash(password, 10);
  const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
  db.query(sql, [username, email, hashed], (err) => {
    if (err) return res.status(500).json({ message: "Email già registrata" });
    res.json({ message: "Registrazione completata" });
  });
});

// ================== LOGIN ==================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err || results.length == 0)
      return res.status(400).json({ message: "Credenziali errate" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Credenziali errate" });

    res.json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  });
});

// ================== API GRUPPI ==================

// Ottenere gruppi di un utente
app.get("/groups", (req, res) => {
  const userId = req.query.userId;
  const sql = `
    SELECT g.id, g.name, g.is_private 
    FROM groups g 
    JOIN user_groups ug ON g.id = ug.group_id
    WHERE ug.user_id = ?`;
  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ groups: results });
  });
});

// Creare gruppo pubblico
app.post("/groups/create", (req, res) => {
  const { name, userId } = req.body;
  const sql = "INSERT INTO groups (name, is_private) VALUES (?, false)";
  db.query(sql, [name], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    const groupId = result.insertId;
    db.query("INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)", [userId, groupId]);
    res.json({ success: true, groupId });
  });
});

// Creare gruppo privato con token
app.post("/groups/create/private", (req, res) => {
  const { name, userId } = req.body;
  const token = crypto.randomBytes(8).toString("hex");
  const sql = "INSERT INTO groups (name, is_private, token) VALUES (?, true, ?)";
  db.query(sql, [name, token], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    const groupId = result.insertId;
    db.query("INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)", [userId, groupId]);
    res.json({ success: true, groupId, token });
  });
});

// Unirsi a gruppo pubblico
app.post("/groups/join/public", (req, res) => {
  const { name, userId } = req.body;
  const sql = "SELECT id FROM groups WHERE name=? AND is_private=false";
  db.query(sql, [name], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: "Gruppo non trovato" });
    const groupId = results[0].id;
    db.query("INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)", [userId, groupId]);
    res.json({ success: true });
  });
});

// Unirsi a gruppo privato tramite token
app.post("/groups/join/private", (req, res) => {
  const { token, userId } = req.body;
  const sql = "SELECT id FROM groups WHERE token=? AND is_private=true";
  db.query(sql, [token], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ error: "Token non valido" });
    const groupId = results[0].id;
    db.query("INSERT INTO user_groups (user_id, group_id) VALUES (?, ?)", [userId, groupId]);
    res.json({ success: true });
  });
});

// ================== MESSAGGI ==================

// Inviare messaggi
app.post("/messages/send", (req, res) => {
  const { userId, groupId, message } = req.body;
  const sql = "INSERT INTO messages (user_id, group_id, message) VALUES (?, ?, ?)";
  db.query(sql, [userId, groupId, message], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ success: true });
  });
});

// Ottenere messaggi di un gruppo
app.get("/messages", (req, res) => {
  const { groupId } = req.query;
  const sql = `
    SELECT m.id, m.message, u.username, m.created_at 
    FROM messages m 
    JOIN users u ON m.user_id = u.id 
    WHERE m.group_id = ? 
    ORDER BY m.created_at ASC`;
  db.query(sql, [groupId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ messages: results });
  });
});

// ================== AVVIO SERVER ==================
app.listen(3000, () => console.log("API attiva su http://localhost:3000"));
