const express = require("express");
const { getDatabase } = require("../db/database");
const { validatePurchase } = require("../middleware/purchaseValidation");

const router = express.Router();

/**
 * GET /api/purchases
 * Fetches all purchases with product names, ordered by purchase date (most recent first)
 * @returns {Object} JSON response with purchases array
 */
router.get("/", (req, res) => {
  try {
    const db = getDatabase();

    const purchases = db
      .prepare(
        `SELECT 
          pu.id,
          pu.product_id as productId,
          p.name as productName,
          pu.quantity,
          pu.purchase_date as purchaseDate,
          pu.status
        FROM purchases pu
        LEFT JOIN products p ON pu.product_id = p.id
        ORDER BY pu.purchase_date DESC, pu.id DESC`
      )
      .all();

    res.json({ purchases });
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({
      error: {
        message: "Failed to fetch purchases",
        code: "DATABASE_ERROR",
      },
    });
  }
});

/**
 * POST /api/purchases
 * Creates a new purchase record with stock validation
 * @body {number} productId - The product ID
 * @body {number} quantity - The quantity to purchase
 * @body {string} purchaseDate - The purchase date (YYYY-MM-DD)
 * @returns {Object} JSON response with created purchase or error
 */
router.post("/", validatePurchase, (req, res) => {
  const { productId, quantity, purchaseDate } = req.validatedPurchase;

  try {
    const db = getDatabase();

    // Check if product exists and get current stock
    const stockInfo = db
      .prepare(
        `SELECT s.quantity as stock, p.name as productName
         FROM stock s
         JOIN products p ON s.product_id = p.id
         WHERE s.product_id = ?`
      )
      .get(productId);

    if (!stockInfo) {
      return res.status(404).json({
        error: {
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND",
        },
      });
    }

    // Check stock availability
    if (stockInfo.stock < quantity) {
      return res.status(409).json({
        error: {
          message: `Insufficient stock. Available: ${stockInfo.stock}, Requested: ${quantity}`,
          code: "INSUFFICIENT_STOCK",
        },
      });
    }

    // Use transaction to ensure atomicity
    const createPurchaseTransaction = db.transaction(() => {
      // Create purchase record
      const insertResult = db
        .prepare(
          `INSERT INTO purchases (product_id, quantity, purchase_date, status)
           VALUES (?, ?, ?, 'active')`
        )
        .run(productId, quantity, purchaseDate);

      // Update stock by subtracting purchased quantity
      db.prepare(
        `UPDATE stock SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = ?`
      ).run(quantity, productId);

      return insertResult.lastInsertRowid;
    });

    const purchaseId = createPurchaseTransaction();

    // Fetch the created purchase to return
    const purchase = db
      .prepare(
        `SELECT 
          pu.id,
          pu.product_id as productId,
          p.name as productName,
          pu.quantity,
          pu.purchase_date as purchaseDate,
          pu.status
        FROM purchases pu
        JOIN products p ON pu.product_id = p.id
        WHERE pu.id = ?`
      )
      .get(purchaseId);

    res.status(201).json({ purchase });
  } catch (error) {
    console.error("Error creating purchase:", error);
    res.status(500).json({
      error: {
        message: "Failed to create purchase",
        code: "DATABASE_ERROR",
      },
    });
  }
});

/**
 * POST /api/purchases/:id/cancel
 * Cancels an existing purchase and restores stock
 * @param {number} id - The purchase ID to cancel
 * @returns {Object} JSON response with updated purchase or error
 */
router.post("/:id/cancel", (req, res) => {
  const purchaseId = parseInt(req.params.id, 10);

  if (isNaN(purchaseId) || purchaseId <= 0) {
    return res.status(400).json({
      error: {
        message: "Invalid purchase ID",
        code: "VALIDATION_ERROR",
      },
    });
  }

  try {
    const db = getDatabase();

    // Check if purchase exists
    const purchase = db
      .prepare(
        `SELECT id, product_id, quantity, status
         FROM purchases
         WHERE id = ?`
      )
      .get(purchaseId);

    if (!purchase) {
      return res.status(404).json({
        error: {
          message: "Purchase not found",
          code: "PURCHASE_NOT_FOUND",
        },
      });
    }

    // Check if already cancelled
    if (purchase.status === "cancelled") {
      return res.status(400).json({
        error: {
          message: "Purchase is already cancelled",
          code: "ALREADY_CANCELLED",
        },
      });
    }

    // Use transaction to ensure atomicity
    const cancelPurchaseTransaction = db.transaction(() => {
      // Update purchase status to cancelled and set cancelled_at timestamp
      db.prepare(
        `UPDATE purchases 
         SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      ).run(purchaseId);

      // Restore stock by adding back the purchased quantity
      db.prepare(
        `UPDATE stock 
         SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = ?`
      ).run(purchase.quantity, purchase.product_id);
    });

    cancelPurchaseTransaction();

    // Fetch the updated purchase to return
    const updatedPurchase = db
      .prepare(
        `SELECT 
          pu.id,
          pu.product_id as productId,
          p.name as productName,
          pu.quantity,
          pu.purchase_date as purchaseDate,
          pu.status,
          pu.cancelled_at as cancelledAt
        FROM purchases pu
        JOIN products p ON pu.product_id = p.id
        WHERE pu.id = ?`
      )
      .get(purchaseId);

    res.json({ purchase: updatedPurchase });
  } catch (error) {
    console.error("Error cancelling purchase:", error);
    res.status(500).json({
      error: {
        message: "Failed to cancel purchase",
        code: "DATABASE_ERROR",
      },
    });
  }
});

module.exports = router;
