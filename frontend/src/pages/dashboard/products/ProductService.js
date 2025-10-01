// frontend/src/pages/products/ProductService.js
import api from "../../../axiosConfig.jsx";

function toCategoriesArray(category) {
  if (!category) return [];
  if (Array.isArray(category)) return category;
  return String(category)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- CREATE ----------
export async function createProduct(form) {
  const fd = new FormData();
  fd.append("title", form.name);
  fd.append("description", form.description || "");
  fd.append("price", String(form.price));
  fd.append("stock", String(form.stock));

  const cats = toCategoriesArray(form.category);
  fd.append("categories", JSON.stringify(cats));

  // create uses 'thumbnail' (manager reads data.thumbnail)
  if (form.thumbnail) fd.append("thumbnail", form.thumbnail);

  if (form.images && form.images.length) {
    Array.from(form.images).forEach((file) => fd.append("images", file));
  }

  const res = await api.post("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data ?? null;
}

// ---------- LIST ----------
export async function fetchProducts() {
  const res = await api.get("/products");
  return res?.data?.data ?? res?.data ?? [];
}

// ---------- GET ONE ----------
export async function getProductById(id) {
  const res = await api.get(`/products/${id}`);
  return res?.data?.data ?? null;
}

// ---------- UPDATE ----------
export async function updateProduct(id, form) {
  const fd = new FormData();
  fd.append("title", form.name);
  fd.append("description", form.description || "");
  fd.append("price", String(form.price));
  fd.append("stock", String(form.stock));

  const cats = toCategoriesArray(form.category);
  fd.append("categories", JSON.stringify(cats));

  // UPDATE must send 'thumbnailMediaId' (controller/manager expect this)
  if (form.thumbnail) fd.append("thumbnailMediaId", form.thumbnail);

  if (form.images && form.images.length) {
    Array.from(form.images).forEach((file) => fd.append("images", file));
  }

  const res = await api.put(`/products/${id}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data ?? null;
}

// ---------- DELETE ----------
export async function deleteProduct(id) {
  const res = await api.delete(`/products/${id}`);
  return res?.data?.data ?? res?.data ?? null;
}
