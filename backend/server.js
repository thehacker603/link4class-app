const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// REGISTRAZIONE
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

// LOGIN
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

app.listen(3000, () => console.log("API attiva su http://localhost:3000"));
