// frontend/src/pages/products/ProductForm.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProduct, getProductById, updateProduct } from "./ProductService";
import { getProductMedia, uploadMediaToProduct } from "../media/MediaService.js";
import MediaPickerModal from "../media/MediaPickerModal.jsx";
import MediaUploadDialog from "../media/MediaUploadDialog.jsx";
import ImageSlot from "../media/ImageSlot.jsx";
import api from "../../axiosConfig.jsx";

const MAX_LOCAL = 3;

function getServerOrigin() {
  const base = (api?.defaults?.baseURL || "").replace(/\/+$/, "");
  if (/^https?:\/\//i.test(base)) return base.replace(/\/api$/i, "");
  try {
    const u = new URL(window.location.origin);
    if (u.port === "3000") u.port = "5001";
    return u.toString().replace(/\/+$/, "");
  } catch {
    return "http://localhost:5001";
  }
}
const SERVER_ORIGIN = getServerOrigin();

const mediaUrl = (m) => {
  const file =
    m?.mediaId?.url ||
    m?.mediaId?.path ||
    m?.mediaId?.filename ||
    m?.filename ||
    "";
  if (!file) return "";
  if (/^https?:\/\//i.test(file)) return file;
  const name = String(file).split(/[\\/]/).pop();
  return `${SERVER_ORIGIN}/uploads/${name}`;
};

const PANEL = "rounded-2xl border border-gray-200 bg-gray-100 p-5 md:p-6";
const PANEL_MIN_H = "min-h-[560px]";
const HERO_H = "h-80 md:h-96";
const THUMB_H = "h-36";

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
    images: null,
  });

  const [localImages, setLocalImages] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [thumbOptions, setThumbOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadProduct = useCallback(async () => {
    if (mode !== "edit") return;
    const p = await getProductById(id);

    const opts = Array.isArray(p.media)
      ? p.media
          .map((m) => {
            const fileId = m?.mediaId?._id || m?.mediaId;
            if (!fileId) return null;
            const label =
              m?.title ||
              m?.mediaId?.title ||
              m?.mediaId?.originalName ||
              m?.mediaId?.filename ||
              String(fileId);
            return { id: String(fileId), label };
          })
          .filter(Boolean)
      : [];

    const currentThumb =
      (Array.isArray(p.media) &&
        p.media.find((x) => x.order === 0)?.mediaId?._id) ||
      "";

    let categoryStr = "";
    if (Array.isArray(p.categories)) {
      categoryStr = p.categories.join(", ");
    } else if (typeof p.category === "string") {
      categoryStr = p.category;
    } else if (typeof p.categories === "string") {
      try {
        const parsed = JSON.parse(p.categories);
        categoryStr = Array.isArray(parsed) ? parsed.join(", ") : String(p.categories);
      } catch {
        categoryStr = String(p.categories || "");
      }
    }

    setThumbOptions(opts);
    setForm({
      name: p.name || p.title || "",
      description: p.description || "",
      category: categoryStr,
      price: p.price ?? "",
      stock: p.stock ?? "",
      thumbnail: currentThumb ? String(currentThumb) : "",
      images: null,
    });
  }, [mode, id]);

  const loadMedia = useCallback(async () => {
    if (mode !== "edit") return;
    const list = await getProductMedia(id);
    const mapped = (Array.isArray(list) ? list : [])
      .map((m) => ({
        ...m,
        relId: String(m?._id),
        mediaId: String(m?.mediaId?._id ?? m?.mediaId),
        url: mediaUrl(m),
        title:
          m?.title ||
          m?.mediaId?.title ||
          m?.mediaId?.originalName ||
          m?.mediaId?.filename ||
          String(m?.mediaId?._id ?? m?._id),
        order: Number(m?.order ?? 0),
      }))
      .sort((a, b) => a.order - b.order)
      .slice(0, 3);
    setEditImages(mapped);
  }, [mode, id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (mode !== "edit") {
        if (alive) setLoading(false);
        return;
      }
      try {
        await loadProduct();
        await loadMedia();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [mode, loadProduct, loadMedia]);

  // Reorder the preview instantly when user changes the thumbnail dropdown
  useEffect(() => {
    if (mode !== "edit") return;
    if (!form.thumbnail) return;

    setEditImages((prev) => {
      const idx = prev.findIndex(
        (m) => String(m.mediaId) === String(form.thumbnail)
      );
      if (idx === -1) return prev;
      const picked = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      const reordered = [
        { ...picked, order: 0 },
        ...rest.map((m, i) => ({ ...m, order: i + 1 })),
      ];
      return reordered;
    });
  }, [form.thumbnail, mode]);

  // Keep dropdown option labels in sync when titles change in modal
  useEffect(() => {
    if (mode !== "edit") return;
    if (!editImages?.length) return;
    setThumbOptions((opts) =>
      opts.map((o) => {
        const match = editImages.find(
          (m) => String(m.mediaId) === String(o.id)
        );
        return match ? { ...o, label: match.title || o.label } : o;
        // keeps option text aligned with latest title displayed in modal
      })
    );
  }, [editImages, mode]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleAddLocal = async (files) => {
    if (mode === "add") {
      const merged = [...localImages, ...files].slice(0, MAX_LOCAL);
      setLocalImages(merged);
      setForm((s) => ({ ...s, images: merged }));
      return;
    }
    const f = Array.from(files || [])[0];
    if (!f) return;
    await uploadMediaToProduct(id, [f]);
    await Promise.all([loadMedia(), loadProduct()]);
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
      "bg-white border",
      errors[field] ? "border-red-500" : "border-gray-200",
      "focus:ring-2",
      errors[field] ? "focus:ring-red-200" : "focus:ring-blue-200",
    ].join(" ");

  if (loading) {
    return <div className="p-6 text-sm text-gray-500 bg-white">Loading…</div>;
  }

  // image slot values
  const s0 = mode === "add" ? localImages[0] || null : editImages[0]?.url || null;
  const s1 = mode === "add" ? localImages[1] || null : editImages[1]?.url || null;
  const s2 = mode === "add" ? localImages[2] || null : editImages[2]?.url || null;

  const handleSlotClick = (idx) => {
    if (mode === "add") {
      setUploadOpen(true);
      return;
    }
    const item = editImages[idx];
    if (item) {
      setSelectedItem(item);
      setEditModalOpen(true);
    } else {
      setUploadOpen(true);
    }
  };

  const canShowPlus =
    (mode === "add" && (localImages?.length ?? 0) < 3) ||
    (mode === "edit" && editImages.length < 3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      if (mode === "edit") {
        // ProductService already sends `thumbnailMediaId` = form.thumbnail
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

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-white">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Product</h1>
        <p className="text-sm text-gray-500">
          Dashboard / Product / {mode === "edit" ? "Edit" : "Add New"}
        </p>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${PANEL_MIN_H}`}>
        {/* IMAGES */}
        <section className={`${PANEL} ${PANEL_MIN_H} flex flex-col`}>
          <h2 className="font-semibold mb-4">Images</h2>

          <ImageSlot
            fileOrUrl={s0}
            label=""
            onClick={() => handleSlotClick(0)}
            className={`${HERO_H} mb-4`}
          />

          <div className="grid grid-cols-3 gap-4">
            <ImageSlot fileOrUrl={s1} label="" onClick={() => handleSlotClick(1)} className={THUMB_H} />
            <ImageSlot fileOrUrl={s2} label="" onClick={() => handleSlotClick(2)} className={THUMB_H} />

            {canShowPlus && (
              <button
                type="button"
                onClick={() => setUploadOpen(true)}
                className="h-36 rounded-xl border border-gray-300 bg-white/80 grid place-items-center hover:border-gray-600"
                title="Add image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            )}
          </div>
        </section>

        {/* DETAILS */}
        <section className={`${PANEL} ${PANEL_MIN_H} flex flex-col`}>
          <h2 className="font-semibold mb-4">Product Details</h2>

          <div className="grow">
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
          </div>

          <div className="mt-6 flex justify-end items-center gap-4">
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

      {mode === "edit" && (
        <MediaPickerModal
          productId={id}
          open={editModalOpen}
          item={selectedItem}
          onClose={() => setEditModalOpen(false)}
          //  patch so the slots reorder immediately
          onPatched={({ relId, title, order }) => {
            setEditImages((prev) => {
              const next = prev.map((x) =>
                x.relId === String(relId)
                  ? { ...x, title, order: Number(order) || 0 }
                  : x
              );
              next.sort((a, b) => a.order - b.order);
              return next;
            });
          }}
          // Refresh both lists so dropdown labels & order are correct after save
          onSaved={async () => {
            await Promise.all([loadMedia(), loadProduct()]);
            setEditModalOpen(false);
          }}
        />
      )}

      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={(files) => {
          setUploadOpen(false);
          handleAddLocal(files);
        }}
      />
    </form>
  );
}
