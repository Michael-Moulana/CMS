// frontend/src/pages/products/ProductForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "./ProductService"; 

export default function ProductForm() {
  const navigate = useNavigate();

  // form data
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    thumbnail: "", // will be chosen from uploaded images later
  });

  // simple field errors
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // keep inputs in sync
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // rules for this story: price > 0 (number), stock >= 0 (integer)
  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = "Product name is required";

    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      e.price = "Price must be a positive number";
    }

    if (
      form.stock === "" ||
      isNaN(form.stock) ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      e.stock = "Stock must be a whole number (0 or more)";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // red-border helper
  const inputClass = (field) =>
    [
      "w-full rounded-md px-3 py-2 outline-none",
      "bg-gray-50 border",
      errors[field] ? "border-red-500" : "border-gray-200",
      "focus:ring-2",
      errors[field] ? "focus:ring-red-200" : "focus:ring-blue-200",
    ].join(" ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // still a no-op for now; backend subtask will wire this
      await createProduct(form);
      navigate("/dashboard/products");
    } catch (err) {
      console.error(err);
      alert("Could not save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      {/* header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Product</h1>
        <p className="text-sm text-gray-500">Dashboard / Product / Add New</p>
      </div>

      {/* two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* left: Images panel */}
        <section className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="font-semibold mb-3">Images</h2>

          {/* placeholder image area (upload will be handled in Media epics) */}
          <div className="rounded-xl border border-gray-200 bg-white/60 h-56 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-500">Image</div>
              <div className="text-xs text-gray-400">
                Upload will be handled from Media section.
              </div>
            </div>
          </div>

          {/* footer strip like figma (icons later) */}
          <div className="mt-4 rounded-xl bg-white/60 border border-gray-200 h-14 flex items-center justify-end px-4 gap-3">
            {/* reserved for future image controls */}
          </div>
        </section>

        {/* right: Product details */}
        <section className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Product Details</h2>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="e.g. Cotton Shirt"
              className={inputClass("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Product Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Brief description..."
              className={inputClass("description")}
              rows={4}
            />
          </div>

          {/* Category + Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <input
                name="category"
                value={form.category}
                onChange={onChange}
                placeholder="e.g. Apparel"
                className={inputClass("category")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Thumbnail
              </label>
              <select
                name="thumbnail"
                value={form.thumbnail}
                onChange={onChange}
                className={inputClass("thumbnail")}
              >
                {/* options will be populated from Media when images exist */}
                <option value="">sample</option>
              </select>
            </div>
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                name="price"
                value={form.price}
                onChange={onChange}
                placeholder="e.g. 49.99"
                className={inputClass("price")}
                aria-invalid={!!errors.price}
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={onChange}
                placeholder="e.g. 10"
                className={inputClass("stock")}
                aria-invalid={!!errors.stock}
              />
              {errors.stock && (
                <p className="text-sm text-red-600 mt-1">{errors.stock}</p>
              )}
            </div>
          </div>

          {/* footer actions */}
          <div className="mt-6 flex justify-end items-center gap-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="text-blue-600 underline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
            >
              {saving ? "Saving..." : "Add Product"}
            </button>
          </div>
        </section>
      </div>
    </form>
  );
}