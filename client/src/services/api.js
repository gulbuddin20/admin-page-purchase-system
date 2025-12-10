import axios from "axios";

/**
 * API Service Layer
 * Provides functions for communicating with the backend REST API
 */

// Create axios instance with base URL configuration
// In development, Vite proxy handles /api requests
// In production, set VITE_API_URL environment variable
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Parse error response from API
 * @param {Error} error - Axios error object
 * @returns {Object} Parsed error with message and code
 */
const parseError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { data, status } = error.response;
    return {
      message: data?.error?.message || "An error occurred",
      code: data?.error?.code || "UNKNOWN_ERROR",
      status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: "Unable to connect to server. Please check your connection.",
      code: "NETWORK_ERROR",
      status: 0,
    };
  } else {
    // Error setting up the request
    return {
      message: error.message || "An unexpected error occurred",
      code: "REQUEST_ERROR",
      status: 0,
    };
  }
};

/**
 * Get all products with stock levels
 * @returns {Promise<Array>} Array of products with id, name, and stock
 * @throws {Object} Error object with message, code, and status
 */
export const getProducts = async () => {
  try {
    const response = await apiClient.get("/products");
    return response.data.products;
  } catch (error) {
    throw parseError(error);
  }
};

/**
 * Get all purchases ordered by date
 * @returns {Promise<Array>} Array of purchases with full details
 * @throws {Object} Error object with message, code, and status
 */
export const getPurchases = async () => {
  try {
    const response = await apiClient.get("/purchases");
    return response.data.purchases;
  } catch (error) {
    throw parseError(error);
  }
};

/**
 * Create a new purchase
 * @param {Object} purchaseData - Purchase data
 * @param {number} purchaseData.productId - Product ID
 * @param {number} purchaseData.quantity - Quantity to purchase
 * @param {string} purchaseData.purchaseDate - Purchase date (YYYY-MM-DD)
 * @returns {Promise<Object>} Created purchase object
 * @throws {Object} Error object with message, code, and status
 */
export const createPurchase = async (purchaseData) => {
  try {
    const response = await apiClient.post("/purchases", purchaseData);
    return response.data.purchase;
  } catch (error) {
    throw parseError(error);
  }
};

/**
 * Cancel an existing purchase
 * @param {number} purchaseId - ID of the purchase to cancel
 * @returns {Promise<Object>} Updated purchase object with cancelled status
 * @throws {Object} Error object with message, code, and status
 */
export const cancelPurchase = async (purchaseId) => {
  try {
    const response = await apiClient.post(`/purchases/${purchaseId}/cancel`);
    return response.data.purchase;
  } catch (error) {
    throw parseError(error);
  }
};

export { apiClient };
