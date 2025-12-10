const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initializeDatabase } = require("./db/database");
const productsRouter = require("./routes/products");
const purchasesRouter = require("./routes/purchases");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/products", productsRouter);
app.use("/api/purchases", purchasesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
