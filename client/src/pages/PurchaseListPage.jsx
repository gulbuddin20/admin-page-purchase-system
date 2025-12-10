import { useState, useEffect } from "react";
import { getPurchases, cancelPurchase } from "../services/api";

/**
 * PurchaseListPage Component
 * Displays all purchases with cancel functionality in a responsive layout
 */
function PurchaseListPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);

  // Fetch purchases on mount
  useEffect(() => {
    fetchPurchases();
  }, []);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err.message || "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel action with confirmation
  const handleCancelClick = (purchaseId) => {
    setConfirmCancelId(purchaseId);
  };

  const handleConfirmCancel = async () => {
    const purchaseId = confirmCancelId;
    setConfirmCancelId(null);
    setCancellingId(purchaseId);
    setError(null);

    try {
      await cancelPurchase(purchaseId);
      setSuccessMessage("Purchase cancelled successfully!");
      // Refresh the list to get updated data
      await fetchPurchases();
    } catch (err) {
      setError(err.message || "Failed to cancel purchase");
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelConfirmDialog = () => {
    setConfirmCancelId(null);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Loading state with spinner
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 sm:py-12">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">
          Loading purchases...
        </p>
      </div>
    );
  }

  // Error state with error message
  if (error && purchases.length === 0) {
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
          Error Loading Purchases
        </h3>
        <p className="mt-2 text-sm sm:text-base text-red-600 wrap-break-word">
          {error}
        </p>
        <button
          onClick={fetchPurchases}
          className="mt-4 px-4 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] min-w-[100px] active:bg-red-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state when no purchases exist
  if (purchases.length === 0) {
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-900">
          No Purchases Yet
        </h3>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          There are no purchase records to display.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Purchase History
        </h2>
        <button
          onClick={fetchPurchases}
          className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[44px] min-w-[100px] active:bg-blue-800"
        >
          Refresh
        </button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <svg
            className="h-5 w-5 text-green-500 mr-3"
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
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}

      {/* Error message for cancellation errors */}
      {error && purchases.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <svg
            className="h-5 w-5 text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg
              className="h-5 w-5"
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
          </button>
        </div>
      )}

      {/* Confirmation Dialog - Mobile-friendly */}
      {confirmCancelId && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-md p-4 sm:p-6 safe-area-inset-bottom">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Cancel Purchase
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Are you sure you want to cancel this purchase? The stock will be
              restored.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={handleCancelConfirmDialog}
                className="w-full sm:w-auto px-4 py-3 sm:py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-h-[44px] active:bg-gray-300"
              >
                No, Keep It
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-3 sm:py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] active:bg-red-800"
              >
                Yes, Cancel Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Table View (hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr
                key={purchase.id}
                className={purchase.status === "cancelled" ? "bg-gray-50" : ""}
              >
                <td
                  className={`px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm ${
                    purchase.status === "cancelled"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  #{purchase.id}
                </td>
                <td
                  className={`px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm ${
                    purchase.status === "cancelled"
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {purchase.productName}
                </td>
                <td
                  className={`px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm ${
                    purchase.status === "cancelled"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {purchase.quantity}
                </td>
                <td
                  className={`px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm ${
                    purchase.status === "cancelled"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {formatDate(purchase.purchaseDate)}
                </td>
                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      purchase.status === "cancelled"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </td>
                <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleCancelClick(purchase.id)}
                    disabled={
                      purchase.status === "cancelled" ||
                      cancellingId === purchase.id
                    }
                    className={`px-3 lg:px-4 py-2 text-sm rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] min-w-[80px] ${
                      purchase.status === "cancelled"
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : cancellingId === purchase.id
                        ? "bg-red-300 text-white cursor-wait"
                        : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800"
                    }`}
                  >
                    {cancellingId === purchase.id ? "Cancelling..." : "Cancel"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (hidden on desktop)*/}
      <div className="md:hidden space-y-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className={`bg-white rounded-lg shadow-sm border p-4 ${
              purchase.status === "cancelled"
                ? "border-gray-200 bg-gray-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span
                  className={`text-sm font-medium ${
                    purchase.status === "cancelled"
                      ? "text-gray-400"
                      : "text-gray-500"
                  }`}
                >
                  #{purchase.id}
                </span>
                <h3
                  className={`text-lg font-semibold ${
                    purchase.status === "cancelled"
                      ? "text-gray-400 line-through"
                      : "text-gray-900"
                  }`}
                >
                  {purchase.productName}
                </h3>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  purchase.status === "cancelled"
                    ? "bg-gray-100 text-gray-600"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {purchase.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
              <div>
                <span className="text-gray-500">Quantity:</span>
                <span
                  className={`ml-2 ${
                    purchase.status === "cancelled"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {purchase.quantity}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Date:</span>
                <span
                  className={`ml-2 ${
                    purchase.status === "cancelled"
                      ? "text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {formatDate(purchase.purchaseDate)}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleCancelClick(purchase.id)}
              disabled={
                purchase.status === "cancelled" || cancellingId === purchase.id
              }
              className={`w-full py-3 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px] ${
                purchase.status === "cancelled"
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : cancellingId === purchase.id
                  ? "bg-red-300 text-white cursor-wait"
                  : "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800"
              }`}
            >
              {cancellingId === purchase.id
                ? "Cancelling..."
                : "Cancel Purchase"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PurchaseListPage;
