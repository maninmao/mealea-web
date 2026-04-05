const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// routes
app.use("/api/menu", require("./routes/menuRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));