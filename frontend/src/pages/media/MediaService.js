// frontend/src/pages/media/MediaService.js
import api from "../../axiosConfig.jsx";

// Fetch product's media via existing product show endpoint
export async function getProductMedia(productId) {
  const res = await api.get(`/products/${productId}`);
  const p = res?.data?.data ?? null;
  return Array.isArray(p?.media) ? p.media : [];
}

// Upload up to 3 images (JPG/PNG, ≤3MB each) to a product
export async function uploadMediaToProduct(productId, files) {
  const fd = new FormData();
  Array.from(files || []).forEach((f) => fd.append("images", f));
  const res = await api.post(`/products/${productId}/media`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res?.data?.data ?? res?.data ?? null;
}

// Update media metadata (title/order)
export async function updateMediaDetails(productId, mediaId, payload) {
  const res = await api.put(`/products/${productId}/media/${mediaId}`, payload);
  return res?.data?.data ?? res?.data ?? null;
}

// Remove one media item from product
export async function deleteMediaFromProduct(productId, mediaId) {
  const res = await api.delete(`/products/${productId}/media/${mediaId}`);
  return res?.data?.data ?? res?.data ?? null;
}
