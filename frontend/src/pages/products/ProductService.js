// frontend/src/pages/products/ProductService.js
import api from "../../axiosConfig.jsx";

// Build FormData for multipart POST
export async function createProduct(form) {
  const fd = new FormData();

  // backend expects these names
  fd.append("title", form.name); // UI uses "name"
  fd.append("description", form.description || "");
  fd.append("price", String(form.price));
  fd.append("stock", String(form.stock));

  // categories: single string -> array handled server-side, but we send "category"
  if (form.category) fd.append("category", form.category);

  // thumbnail (optional media id string)
  if (form.thumbnail) fd.append("thumbnail", form.thumbnail);

  // images[] (optional; multiple)
  if (form.images && form.images.length) {
    Array.from(form.images).forEach((file) => fd.append("images", file));
  }

  const res = await api.post("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // ResponseDecorator shape: { success, message, data }
  return res.data?.data || res.data;
}

export async function fetchProducts() {
  const res = await api.get("/products");
  return res.data?.data || res.data || [];
}
