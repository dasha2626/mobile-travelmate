const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/destinations/:userId", (req, res) => {
  db.query(
    "SELECT * FROM liked_destinations WHERE user_id = ? ORDER BY created_at DESC",
    [req.params.userId],
    (err, results) => {
      if (err) return res.status(500).json(err);
      results.forEach(r => {
        if (typeof r.highlights === "string") r.highlights = JSON.parse(r.highlights);
      });
      res.json(results);
    }
  );
});

router.post("/destinations", (req, res) => {
  const { userId, name, country, tagline, description, highlights, bestTime, estimatedCost } = req.body;
  db.query(
   "INSERT INTO liked_destinations (user_id, name, country, tagline, description, highlights, best_time, estimated_cost) VALUES (?,?,?,?,?,?,?,?)",
[userId, name, country, tagline, description, JSON.stringify(highlights), bestTime, estimatedCost],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/destinations/:id", (req, res) => {
  db.query("DELETE FROM liked_destinations WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

module.exports = router;