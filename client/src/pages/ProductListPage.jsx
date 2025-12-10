import { useState, useEffect } from "react";
import { getProducts } from "../services/api";

/**
 * ProductListPage Component
 * Displays all products with their stock levels in a responsive grid layout
 */
function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Loading state with spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
          Loading products...
        </p>
      </div>
    );
  }

  // Error state with error message
  if (error) {
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
          {error}
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

  // Empty state when no products exist
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
          There are currently no products in the inventory.
        </p>
      </div>
    );
  }

  // Product list with responsive grid
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Products
        </h2>
        <button
          onClick={fetchProducts}
          className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[100px] active:bg-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 lg:p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3">
              <div className="flex-1 min-w-0 w-full sm:w-auto">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 wrap-break-word">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">ID: {product.id}</p>
              </div>
              <div
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap ${
                  product.stock > 50
                    ? "bg-green-100 text-green-800"
                    : product.stock > 10
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {product.stock} in stock
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductListPage;
