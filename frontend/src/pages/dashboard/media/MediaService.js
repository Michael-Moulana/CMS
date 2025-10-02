import api from "../../../axiosConfig.jsx";

// Get product with embedded media relation array
export async function getProductMedia(productId) {
  console.log("[getProductMedia] GET", `/products/${productId}`); // <- should log this
  const res = await api.get(`/products/${productId}`);
  const p = res?.data?.data ?? null;
  return Array.isArray(p?.media) ? p.media : [];
}

// Upload up to 3 images (JPG/PNG, ≤3MB each)
export async function uploadMediaToProduct(productId, files) {
  const fd = new FormData();
  Array.from(files || []).forEach((f) => fd.append("images", f));
  return (
    (
      await api.post(`/products/${productId}/media`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    )?.data?.data ?? null
  );
}

export async function updateMediaDetails(productId, relationId, payload) {
  return (
    (await api.put(`/products/${productId}/media/${relationId}`, payload))?.data
      ?.data ?? null
  );
}

export async function deleteMediaFromProduct(productId, relationId) {
  return (
    (await api.delete(`/products/${productId}/media/${relationId}`))?.data
      ?.data ?? null
  );
}

// delete one media from a product by relation id (preferred)
export async function deleteProductMedia(productId, mediaRelId) {
  const res = await api.delete(`/products/${productId}/media/${mediaRelId}`);
  return res?.data?.data ?? res?.data ?? null;
}
