const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const router = express.Router();

/* REGISTER */
router.post("/register", async (req, res) => {

    const { login, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        "INSERT INTO users (login,email,password) VALUES (?,?,?)",
        [login, email, hashedPassword],
        (err) => {

            if(err) return res.status(500).json(err);

            res.json({ message: "User created" });
        }
    );
});


/* LOGIN */
router.post("/login", (req, res) => {

    const { login, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE login=?",
        [login],
        async (err, results) => {

            if(err) return res.status(500).json(err);

            if(results.length === 0)
                return res.status(401).json({ message: "User not found" });

            const user = results[0];

            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if(!isMatch)
                return res.status(401).json({ message: "Wrong password" });

          const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

           res.json({
 token,
 user: {
   id: user.id,
   login: user.login,
   avatar: user.avatar
 
 }
});
        }
    );
});

module.exports = router;