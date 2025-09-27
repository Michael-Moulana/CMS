import api from "../../axiosConfig.jsx";

/**
 * Normalize a category input (string like "a, b" or single "a")
 * into an array so the backend receives `categories: [...]`
 */
function toCategoriesArray(category) {
  if (!category) return [];
  if (Array.isArray(category)) return category;
  // split on comma and trim
  return String(category)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- CREATE ----------
export async function createProduct(form) {
  const fd = new FormData();

  // backend expects "title" but UI uses "name"
  fd.append("title", form.name);
  fd.append("description", form.description || "");
  fd.append("price", String(form.price));
  fd.append("stock", String(form.stock));

  // IMPORTANT: send categories as JSON array (prevents ["..."] showing up later)
  const cats = toCategoriesArray(form.category);
  fd.append("categories", JSON.stringify(cats));

  // optional thumbnail (media id)
  if (form.thumbnail) fd.append("thumbnail", form.thumbnail);

  // optional images (multiple)
  if (form.images && form.images.length) {
    Array.from(form.images).forEach((file) => fd.append("images", file));
  }

  const res = await api.post("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // ResponseDecorator: { success, message, data }
  return res?.data?.data ?? res?.data ?? null;
}

// ---------- LIST ----------
export async function fetchProducts() {
  const res = await api.get("/products");
  return res?.data?.data ?? res?.data ?? [];
}

// ---------- GET ONE (for /:id/edit) ----------
export async function getProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res?.data?.data ?? null;
}

// ---------- UPDATE func ----------
export async function updateProduct(id, form) {
  const fd = new FormData();

  fd.append("title", form.name);
  fd.append("description", form.description || "");
  fd.append("price", String(form.price));
  fd.append("stock", String(form.stock));

  // send categories as JSON array (matches backend ProductManager)
  const cats = toCategoriesArray(form.category);
  fd.append("categories", JSON.stringify(cats));

  if (form.thumbnail) fd.append("thumbnail", form.thumbnail);

  if (form.images && form.images.length) {
    Array.from(form.images).forEach((file) => fd.append("images", file));
  }

  const res = await api.put(`/products/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res?.data?.data ?? res?.data ?? null;
}
