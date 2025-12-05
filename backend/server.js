const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./database/connectDB");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");

// Middleware
app.use(
  cors({
    origin: ["https://josh-net.vercel.app/", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/student", studentRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "JOSH Net API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal server error",
    type: "error",
    data: null,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    type: "error",
    data: null,
  });
});

// Start server
app.listen(PORT, () => console.log("Server running on PORT:", PORT));

module.exports = app;
