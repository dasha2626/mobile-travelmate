const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const authRoutes = require("./routes/auth");
const avatarRoutes = require("./routes/avatar");
const tripRoutes = require("./routes/trips");
const tripDetailsRoutes = require("./routes/tripDetails");
const destinationRoutes = require("./routes/destinations");

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", authRoutes);
app.use("/api", avatarRoutes);
app.use("/api", tripRoutes);
app.use("/api", tripDetailsRoutes);
app.use("/api", destinationRoutes);

app.listen(3000, "0.0.0.0", () => {
    console.log("Server running 🚀");
});

