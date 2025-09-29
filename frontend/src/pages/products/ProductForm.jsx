// frontend/src/pages/products/ProductForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProductById, updateProduct } from "./ProductService";
import MediaPickerModal from "../media/MediaPickerModal.jsx";
import MediaUploadDialog from "../media/MediaUploadDialog.jsx";

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const mode = useMemo(() => (id ? "edit" : "add"), [id]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    thumbnail: "",
    images: null, // will hold an array of File objects on "add"
  });

  const [thumbOptions, setThumbOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  // dialogs
  const [mediaOpen, setMediaOpen] = useState(false);   // picker (edit)
  const [uploadOpen, setUploadOpen] = useState(false); // upload (add/edit standalone)

  // local images to be sent on create
  const [localImages, setLocalImages] = useState([]); // File[]

  useEffect(() => {
    if (mode !== "edit") return;
    let alive = true;
    (async () => {
      try {
        const p = await getProductById(id);
        if (!alive || !p) return;

        const opts = Array.isArray(p.media)
          ? p.media
              .map((m) => {
                const mid = m?.mediaId?._id || m?.mediaId || m?._id;
                if (!mid) return null;
                const label =
                  m?.mediaId?.originalName ||
                  m?.mediaId?.filename ||
                  (typeof m?.mediaId === "string" ? m.mediaId : String(mid));
                return { id: String(mid), label };
              })
              .filter(Boolean)
          : [];

        setThumbOptions(opts);

        const currentThumb =
          (Array.isArray(p.media) && p.media.find((x) => x.order === 0)?.mediaId?._id) || "";

        setForm({
          name: p.name || p.title || "",
          description: p.description || "",
          category: Array.isArray(p.categories) ? p.categories.join(", ") : p.category || "",
          price: p.price ?? "",
          stock: p.stock ?? "",
          thumbnail: currentThumb ? String(currentThumb) : "",
          images: null,
        });
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, id]);

  // whenever localImages changes, reflect into form.images so ProductService can send them
  useEffect(() => {
    if (localImages.length) {
      setForm((s) => ({ ...s, images: localImages }));
    } else {
      setForm((s) => ({ ...s, images: null }));
    }
  }, [localImages]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Product name is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Price must be a positive number";
    if (
      form.stock === "" ||
      isNaN(form.stock) ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    )
      e.stock = "Stock must be a whole number (0 or more)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

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
      if (mode === "edit") {
        await updateProduct(id, form);
      } else {
        await createProduct(form);
      }

      const flash = {
        message: mode === "edit" ? "Product updated" : "Product created",
        type: "success",
        ts: Date.now(),
      };
      sessionStorage.setItem("products_flash", JSON.stringify(flash));
      navigate("/dashboard/products", { state: { flash } });
    } catch (err) {
      console.error(err);
      alert("Could not save the product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Product</h1>
        <p className="text-sm text-gray-500">
          Dashboard / Product / {mode === "edit" ? "Edit" : "Add New"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IMAGES — matches Figma */}
        <section className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Images</h2>

          <div className="relative rounded-2xl border border-gray-200 bg-white/60 p-5">
            {/* grid: big primary (top), two squares + plus square (bottom) */}
            <div className="grid grid-cols-3 gap-4">
              {/* primary spans all cols */}
              <div className="col-span-3 h-64 md:h-72 rounded-xl border border-dashed border-gray-300 bg-white/70 grid place-items-center">
                {/* image icon */}
                <svg className="w-10 h-10 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M8 13l2.5-3 3.5 4 2-2 3 4H6z" />
                  <circle cx="9" cy="9" r="1.5" />
                </svg>
              </div>

              {/* two image squares */}
              {Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-xl border border-dashed border-gray-300 bg-white/70 grid place-items-center"
                >
                  <svg className="w-8 h-8 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M8 13l2.5-3 3.5 4 2-2 3 4H6z" />
                    <circle cx="9" cy="9" r="1.5" />
                  </svg>
                </div>
              ))}

              {/* plus square */}
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="h-32 rounded-xl border border-gray-300 bg-white grid place-items-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Add image"
              >
                <svg className="w-8 h-8 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>

          {/* manage images (edit only) */}
          {mode === "edit" && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setMediaOpen(true)}
                className="px-3 py-1.5 rounded-lg border bg-white text-sm"
              >
                Manage Images
              </button>
            </div>
          )}
        </section>

        {/* PRODUCT DETAILS */}
        <section className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">Product Details</h2>

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
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Product Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Brief description..."
              className={inputClass("description")}
              rows={4}
            />
          </div>

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
              <label className="block text-sm font-medium mb-1">Select Thumbnail</label>
              {mode === "add" ? (
                <select className={`${inputClass("thumbnail")} bg-gray-100`} disabled>
                  <option>No images yet — add via Media</option>
                </select>
              ) : (
                <select
                  name="thumbnail"
                  value={form.thumbnail}
                  onChange={onChange}
                  className={inputClass("thumbnail")}
                >
                  <option value="">— No thumbnail —</option>
                  {thumbOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

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
              {errors.price && <p className="text-sm text-red-600 mt-1">{errors.price}</p>}
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
              {errors.stock && <p className="text-sm text-red-600 mt-1">{errors.stock}</p>}
            </div>
          </div>

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
              {saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </section>
      </div>

      {/* picker for edit */}
      {mode === "edit" && (
        <MediaPickerModal
          productId={id}
          open={mediaOpen}
          onClose={() => setMediaOpen(false)}
          onPickThumbnail={(mediaId) => {
            setForm((f) => ({ ...f, thumbnail: String(mediaId) }));
            setMediaOpen(false);
          }}
        />
      )}

      {/* upload dialog for the "+" box */}
      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={(file) => {
          setLocalImages((prev) => {
            const next = [...prev, file].slice(0, 3);
            return next;
          });
          setUploadOpen(false);
        }}
      />
    </form>
  );
}
