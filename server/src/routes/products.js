const express = require("express");
const { getDatabase } = require("../db/database");

const router = express.Router();

/**
 * GET /api/products
 * Fetches all products with their stock levels
 * @returns {Object} JSON response with products array
 */
router.get("/", (req, res) => {
  try {
    const db = getDatabase();

    const products = db
      .prepare(
        `SELECT 
          p.id,
          p.name,
          s.quantity as stock
        FROM products p
        LEFT JOIN stock s ON p.id = s.product_id
        ORDER BY p.id`
      )
      .all();

    res.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch products",
        code: "DATABASE_ERROR",
      },
    });
  }
});

module.exports = router;
