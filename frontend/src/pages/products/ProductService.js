// frontend/src/pages/products/ProductService.js
import api from "../../axiosConfig.jsx";

// GET /api/products
export async function getProducts() {
  const res = await api.get("/products");
  // backend wraps responses as { success, message, data }
  return res?.data?.data ?? [];
}

// POST /api/products  (no images yet)
export async function createProduct(payload) {
  // backend route uses multer; send multipart even without files
  const fd = new FormData();

  // map frontend fields -> backend fields
  fd.append("title", payload.name);
  fd.append("description", payload.description ?? "");
  fd.append("price", Number(payload.price || 0));
  fd.append("stock", Number(payload.stock || 0));

  // categories: backend expects an array; we’ll send single category as array
  const cats = payload.category ? [payload.category] : [];
  fd.append("categories", JSON.stringify(cats));

  // optional thumbnail media id (string); safe to send empty
  if (payload.thumbnail) fd.append("thumbnail", payload.thumbnail);

  // NOTE: no files appended yet

  const res = await api.post("/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data;
}