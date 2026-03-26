const express = require("express");
const router = express.Router();
const db = require("../config/db");

// NOCLEGI
router.get("/trips/:tripId/accommodations", (req, res) => {
  db.query("SELECT * FROM accommodations WHERE trip_id = ? ORDER BY date_from ASC", [req.params.tripId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.post("/trips/:tripId/accommodations", (req, res) => {
  const { name, address, city, country, latitude, longitude, dateFrom, dateTo, price, notes } = req.body;
  db.query(
    "INSERT INTO accommodations (trip_id, name, address, city, country, latitude, longitude, date_from, date_to, price, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [req.params.tripId, name, address, city, country, latitude, longitude, dateFrom, dateTo, price || null, notes || null],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/trips/:tripId/accommodations/:id", (req, res) => {
  db.query("DELETE FROM accommodations WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// TRANSPORT
router.get("/trips/:tripId/transports", (req, res) => {
  db.query("SELECT * FROM transports WHERE trip_id = ? ORDER BY departure_date ASC", [req.params.tripId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.post("/trips/:tripId/transports", (req, res) => {
  const { name, fromAddress, toAddress, fromLatitude, fromLongitude, toLatitude, toLongitude, transportType, departureDate, arrivalDate, price, notes } = req.body;
  db.query(
    "INSERT INTO transports (trip_id, name, from_address, to_address, from_latitude, from_longitude, to_latitude, to_longitude, transport_type, departure_date, arrival_date, price, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
    [req.params.tripId, name, fromAddress, toAddress, fromLatitude, fromLongitude, toLatitude, toLongitude, transportType, departureDate, arrivalDate, price || null, notes || null],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/trips/:tripId/transports/:id", (req, res) => {
  db.query("DELETE FROM transports WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// PUNKTY ZWIEDZANIA
router.get("/trips/:tripId/points", (req, res) => {
  db.query("SELECT * FROM points_of_interest WHERE trip_id = ? ORDER BY visit_date ASC", [req.params.tripId], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.post("/trips/:tripId/points", (req, res) => {
  const { name, address, city, country, latitude, longitude, category, visitDate, price, notes } = req.body;
  db.query(
    "INSERT INTO points_of_interest (trip_id, name, address, city, country, latitude, longitude, category, visit_date, price, notes) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
    [req.params.tripId, name, address, city, country, latitude, longitude, category, visitDate, price || null, notes || null],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

router.delete("/trips/:tripId/points/:id", (req, res) => {
  db.query("DELETE FROM points_of_interest WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});
router.put("/trips/:tripId/accommodations/:id", (req, res) => {
  const { name, address, city, country, latitude, longitude, dateFrom, dateTo, price, notes } = req.body;
  db.query(
    "UPDATE accommodations SET name=?, address=?, city=?, country=?, latitude=?, longitude=?, date_from=?, date_to=?, price=?, notes=? WHERE id=?",
    [name, address, city, country, latitude, longitude, dateFrom, dateTo, price || null, notes || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

router.put("/trips/:tripId/transports/:id", (req, res) => {
  const { name, fromAddress, toAddress, fromLatitude, fromLongitude, toLatitude, toLongitude, transportType, departureDate, arrivalDate, price, notes } = req.body;
  db.query(
    "UPDATE transports SET name=?, from_address=?, to_address=?, from_latitude=?, from_longitude=?, to_latitude=?, to_longitude=?, transport_type=?, departure_date=?, arrival_date=?, price=?, notes=? WHERE id=?",
    [name, fromAddress, toAddress, fromLatitude, fromLongitude, toLatitude, toLongitude, transportType, departureDate, arrivalDate, price || null, notes || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

router.put("/trips/:tripId/points/:id", (req, res) => {
  const { name, address, city, country, latitude, longitude, category, visitDate, price, notes } = req.body;
  db.query(
    "UPDATE points_of_interest SET name=?, address=?, city=?, country=?, latitude=?, longitude=?, category=?, visit_date=?, price=?, notes=? WHERE id=?",
    [name, address, city, country, latitude, longitude, category, visitDate, price || null, notes || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});
module.exports = router;