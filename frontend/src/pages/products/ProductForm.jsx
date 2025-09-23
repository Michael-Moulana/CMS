// frontend/src/pages/products/ProductForm.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function ProductForm() {
  const navigate = useNavigate();

  // Soft grey panel (like Figma card)
  const panelClass =
    "rounded-2xl border border-gray-200 bg-[#F5F7FA] shadow-sm p-6";

  // White, subtle surface inside a card
  const surfaceClass =
    "rounded-2xl border border-gray-200 bg-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]";

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Product form submitted (placeholder).");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Product</h1>
        <p className="text-xs text-gray-400">Dashboard / Product / Add New</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Images */}
          <div className={panelClass}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>

            <div className={`${surfaceClass} h-72 flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-gray-500 text-2xl font-medium mb-2">Image</div>
                <div className="text-gray-400 text-sm">
                  Upload will be handled from Media section.
                </div>
              </div>
            </div>

            <div className="mt-6" />
          </div>

          {/* Right: Product Details */}
          <div className={panelClass}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Product Details
            </h2>

            <div className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cotton Shirt"
                  className="w-full h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Brief description..."
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                />
              </div>

              {/* Category + Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apparel"
                    className="w-full h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Thumbnail
                  </label>
                  <select
                    className="w-full h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm"
                    defaultValue=""
                    aria-label="Select Thumbnail"
                  >
                    <option value="" disabled>
                      sample
                    </option>
                    {/* real options will come from Media */}
                  </select>
                </div>
              </div>

              {/* Price + Stock (sits on the same grey card) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 49.99"
                    className="w-full h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10"
                    className="w-full h-10 rounded-xl border border-gray-300 bg-white px-3 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions: Cancel blue + underlined, Add Product primary */}
        <div className="mt-6 flex items-center justify-end gap-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 underline hover:text-blue-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 px-5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}
