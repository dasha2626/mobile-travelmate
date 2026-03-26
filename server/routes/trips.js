const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Pobierz wszystkie podróże użytkownika
router.get("/trips", (req, res) => {
  const { userId } = req.query;
  db.query(
    "SELECT * FROM trips WHERE user_id = ? ORDER BY date_from DESC",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// Dodaj podróż
router.post("/trips", (req, res) => {
  const { userId, title, country, city, address, latitude, longitude, dateFrom, dateTo, type, rating, notes } = req.body;
  db.query(
    `INSERT INTO trips (user_id, title, country, city, address, latitude, longitude, date_from, date_to, type, rating, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, title, country, city, address, latitude, longitude, dateFrom, dateTo, type || "planned", rating || null, notes || null],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

// Edytuj podróż
router.put("/trips/:id", (req, res) => {
  const { title, country, city, address, latitude, longitude, dateFrom, dateTo, type, rating, notes } = req.body;
  db.query(
    `UPDATE trips SET title=?, country=?, city=?, address=?, latitude=?, longitude=?, date_from=?, date_to=?, type=?, rating=?, notes=?
     WHERE id=?`,
    [title, country, city, address, latitude, longitude, dateFrom, dateTo, type, rating || null, notes || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// Usuń podróż
router.delete("/trips/:id", (req, res) => {
  db.query("DELETE FROM trips WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

module.exports = router;