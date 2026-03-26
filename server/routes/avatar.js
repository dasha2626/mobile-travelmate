const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../config/db");

const router = express.Router();

/* STORAGE */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/avatars");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

/* UPLOAD AVATAR */
router.post("/avatar/:userId", upload.single("avatar"), (req, res) => {

    const userId = req.params.userId;
    const filePath = "/uploads/avatars/" + req.file.filename;

    const sql = "UPDATE users SET avatar=? WHERE id=?";

    db.query(sql, [filePath, userId], (err) => {
        if (err) return res.status(500).json(err);

        res.json({
            message: "Avatar updated",
            avatar: filePath
        });
    });
});

/* GET AVATAR */
router.get("/avatar/:userId", (req, res) => {

    const sql = "SELECT avatar FROM users WHERE id=?";

    db.query(sql, [req.params.userId], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json(result[0]);
    });
});

module.exports = router;