/**
 * Validation middleware for purchase data
 * Validates required fields, quantity, and date constraints
 */

/**
 * Validate purchase creation request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function validatePurchase(req, res, next) {
  const { productId, quantity, purchaseDate } = req.body;
  const errors = [];

  // Check for empty or missing required fields
  if (productId === undefined || productId === null || productId === "") {
    errors.push({ field: "productId", message: "Product ID is required" });
  }

  if (quantity === undefined || quantity === null || quantity === "") {
    errors.push({ field: "quantity", message: "Quantity is required" });
  }

  if (
    purchaseDate === undefined ||
    purchaseDate === null ||
    purchaseDate === ""
  ) {
    errors.push({
      field: "purchaseDate",
      message: "Purchase date is required",
    });
  }

  // If required fields are missing, return early
  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
      },
    });
  }

  // Validate quantity is a number
  const parsedQuantity = Number(quantity);
  if (isNaN(parsedQuantity)) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a valid number",
    });
  } else if (parsedQuantity <= 0) {
    // Validate quantity is positive
    errors.push({
      field: "quantity",
      message: "Quantity must be a positive number",
    });
  } else if (!Number.isInteger(parsedQuantity)) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a whole number",
    });
  }

  // Validate date is not in the future
  const purchaseDateObj = new Date(purchaseDate);
  if (isNaN(purchaseDateObj.getTime())) {
    errors.push({
      field: "purchaseDate",
      message: "Purchase date must be a valid date",
    });
  } else {
    // Compare dates without time component
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (purchaseDateObj > today) {
      errors.push({
        field: "purchaseDate",
        message: "Purchase date cannot be in the future",
      });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: {
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        details: errors,
      },
    });
  }

  // Attach parsed values to request for use in route handler
  req.validatedPurchase = {
    productId: Number(productId),
    quantity: parsedQuantity,
    purchaseDate: purchaseDate,
  };

  next();
}

module.exports = { validatePurchase };
