import { useState, useEffect } from "react";
import { getProducts, createPurchase } from "../services/api";

/**
 * PurchaseFormPage Component
 * Form for creating new purchase records with validation
 */
function PurchaseFormPage() {
  // Products state for dropdown
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    purchaseDate: "",
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch products on mount for dropdown options
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setProductsError(err.message || "Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format for max date validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Validate a single field
  const validateField = (name, value) => {
    switch (name) {
      case "productId":
        if (!value || value === "") {
          return "Please select a product";
        }
        return null;

      case "quantity": {
        if (!value || value === "") {
          return "Quantity is required";
        }
        // Check for non-numeric value
        if (isNaN(value) || isNaN(parseFloat(value))) {
          return "Quantity must be a number";
        }
        const numValue = parseFloat(value);
        // Check for negative or zero quantity
        if (numValue <= 0) {
          return "Quantity must be a positive number";
        }
        // Check for non-integer
        if (!Number.isInteger(numValue)) {
          return "Quantity must be a whole number";
        }
        return null;
      }

      case "purchaseDate": {
        if (!value || value === "") {
          return "Purchase date is required";
        }
        // Check for future date
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) {
          return "Purchase date cannot be in the future";
        }
        return null;
      }

      default:
        return null;
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};

    const productIdError = validateField("productId", formData.productId);
    if (productIdError) newErrors.productId = productIdError;

    const quantityError = validateField("quantity", formData.quantity);
    if (quantityError) newErrors.quantity = quantityError;

    const purchaseDateError = validateField(
      "purchaseDate",
      formData.purchaseDate
    );
    if (purchaseDateError) newErrors.purchaseDate = purchaseDateError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change with real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear success/error messages when user starts typing
    setSubmitSuccess(false);
    setSubmitError(null);

    // Validate field on change
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const purchaseData = {
        productId: parseInt(formData.productId, 10),
        quantity: parseInt(formData.quantity, 10),
        purchaseDate: formData.purchaseDate,
      };

      await createPurchase(purchaseData);

      // Success: clear form and show success message
      setFormData({
        productId: "",
        quantity: "",
        purchaseDate: "",
      });
      setErrors({});
      setSubmitSuccess(true);

      // Refresh products to get updated stock levels
      fetchProducts();
    } catch (err) {
      // Display error message on API errors
      setSubmitError(err.message || "Failed to create purchase");
    } finally {
      setSubmitting(false);
    }
  };

  // Check if form is valid for enabling submit button
  const isFormValid = () => {
    return (
      formData.productId &&
      formData.quantity &&
      formData.purchaseDate &&
      Object.keys(errors).every((key) => !errors[key])
    );
  };

  // Get selected product's stock for display
  const getSelectedProductStock = () => {
    if (!formData.productId) return null;
    const product = products.find(
      (p) => p.id === parseInt(formData.productId, 10)
    );
    return product ? product.stock : null;
  };

  // Loading state for products
  if (productsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
          Loading products...
        </p>
      </div>
    );
  }

  // Error state for products loading
  if (productsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
        <svg
          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-red-800">
          Error Loading Products
        </h3>
        <p className="mt-2 text-sm sm:text-base text-red-600 wrap-break-word">
          {productsError}
        </p>
        <button
          onClick={fetchProducts}
          className="mt-4 px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] min-w-[100px] active:bg-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty products state
  if (products.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
        <svg
          className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">
          No Products Available
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          There are no products available for purchase.
        </p>
      </div>
    );
  }

  const selectedStock = getSelectedProductStock();

  return (
    <div className="max-w-lg mx-auto px-0 sm:px-4">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        New Purchase
      </h2>

      {/* Success message */}
      {submitSuccess && (
        <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center">
            <svg
              className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5 sm:mt-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm sm:text-base text-green-800 font-medium">
              Purchase created successfully!
            </p>
          </div>
        </div>
      )}

      {/* Error message for API errors */}
      {submitError && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center">
            <svg
              className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5 sm:mt-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="text-sm sm:text-base text-red-800 font-medium wrap-break-word">
              {submitError}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 sm:space-y-6"
      >
        {/* Product dropdown */}
        <div>
          <label
            htmlFor="productId"
            className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
          >
            Product <span className="text-red-500">*</span>
          </label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[44px] text-base ${
              errors.productId
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option
                key={product.id}
                value={product.id}
              >
                {product.name} (Stock: {product.stock})
              </option>
            ))}
          </select>
          {errors.productId && (
            <p className="mt-1.5 text-sm text-red-600">{errors.productId}</p>
          )}
          {selectedStock !== null && (
            <p className="mt-1.5 text-sm text-gray-500">
              Available stock: {selectedStock}
            </p>
          )}
        </div>

        {/* Quantity input */}
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
          >
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="Enter quantity"
            className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[44px] text-base ${
              errors.quantity
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
          />
          {errors.quantity && (
            <p className="mt-1.5 text-sm text-red-600">{errors.quantity}</p>
          )}
        </div>

        {/* Date picker */}
        <div>
          <label
            htmlFor="purchaseDate"
            className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
          >
            Purchase Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            max={getTodayDate()}
            className={`w-full px-3 sm:px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors min-h-[44px] text-base ${
              errors.purchaseDate
                ? "border-red-500 bg-red-50"
                : "border-gray-300 bg-white"
            }`}
          />
          {errors.purchaseDate && (
            <p className="mt-1.5 text-sm text-red-600">{errors.purchaseDate}</p>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={submitting || !isFormValid()}
            className={`w-full px-6 py-3.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[48px] text-base ${
              submitting || !isFormValid()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800"
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Purchase...
              </span>
            ) : (
              "Create Purchase"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PurchaseFormPage;
