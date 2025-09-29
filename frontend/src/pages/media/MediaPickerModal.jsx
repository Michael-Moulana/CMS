// frontend/src/pages/media/MediaPickerModal.jsx
import { useEffect, useRef, useState } from "react";
import {
  getProductMedia,
  uploadMediaToProduct,
  deleteMediaFromProduct,
  updateMediaDetails,
} from "./MediaService";
import MediaUploadDialog from "./MediaUploadDialog.jsx";

const MAX_FILES = 3;
const MAX_SIZE = 3 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png"];

export default function MediaPickerModal({
  productId,
  open,
  onClose,
  onPickThumbnail, // (mediaId) => void
}) {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false); // NEW: upload dialog toggle
  const fileRef = useRef(null); // kept only if you still want to keep a classic input, not used now

  // load list when opened
  useEffect(() => {
    if (!open || !productId) return;
    (async () => {
      setError("");
      try {
        const list = await getProductMedia(productId);
        setItems(list);
      } catch {
        setError("Failed to load media");
      }
    })();
  }, [open, productId]);

  // (still used by onAdd guard below)
  const validate = (files) => {
    if (!files?.length) return "No files selected";
    if (files.length + items.length > MAX_FILES) return `Max ${MAX_FILES} images per product`;
    for (const f of files) {
      if (!ALLOWED.includes(f.type)) return "Only JPG/PNG allowed";
      if (f.size > MAX_SIZE) return "Each file must be ≤ 3MB";
    }
    return "";
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm("Delete this image?")) return;
    setBusy(true);
    setError("");
    try {
      await deleteMediaFromProduct(productId, mediaId);
      setItems((prev) =>
        prev.filter((m) => String(m?.mediaId?._id ?? m?._id) !== String(mediaId))
      );
    } catch {
      setError("Delete failed");
    } finally {
      setBusy(false);
    }
  };

  const handleMetaBlur = async (mediaId, newTitle, newOrder, oldTitle, oldOrder) => {
    const o = Number(newOrder);
    if (newTitle === oldTitle && o === oldOrder) return;
    setBusy(true);
    setError("");
    try {
      await updateMediaDetails(productId, mediaId, { title: newTitle, order: o });
      const list = await getProductMedia(productId);
      setItems(list);
    } catch {
      setError("Update failed");
    } finally {
      setBusy(false);
    }
  };

  // NEW: called by MediaUploadDialog when "add" is pressed
  const handleAddFromDialog = async (file) => {
    const msg = validate([file]);
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await uploadMediaToProduct(productId, [file]); // POST :id/media
      const list = await getProductMedia(productId);
      setItems(list);
      setUploadOpen(false);
    } catch {
      setError("Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm grid place-items-center">
      <div className="w-[92vw] max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold">Product Media</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              JPG/PNG • up to {MAX_FILES} images • ≤ 3MB each
            </div>

            {/* Open the pretty upload dialog */}
            <button
              onClick={() => setUploadOpen(true)}
              disabled={busy || items.length >= MAX_FILES}
              className="px-3 py-2 rounded-lg border bg-white disabled:opacity-50"
            >
              + Add image
            </button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((it) => {
              const mid = String(it?.mediaId?._id ?? it?._id);
              const title =
                it?.mediaId?.title ||
                it?.mediaId?.originalName ||
                it?.mediaId?.filename ||
                mid;
              const order = it?.order ?? 0;

              // Replace placeholder with actual <img> once you expose URLs.
              return (
                <div key={mid} className="rounded-xl border overflow-hidden">
                  <div className="aspect-video bg-gray-100 grid place-items-center text-gray-400">
                    <div className="text-xs px-2 text-center">{title}</div>
                  </div>

                  <div className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Title</label>
                        <input
                          defaultValue={title}
                          onBlur={(e) => handleMetaBlur(mid, e.target.value, order, title, order)}
                          className="w-full border rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500">Order</label>
                        <input
                          type="number"
                          min={0}
                          defaultValue={order}
                          onBlur={(e) =>
                            handleMetaBlur(mid, title, e.target.value, title, order)
                          }
                          className="w-full border rounded-md px-2 py-1 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onPickThumbnail?.(mid)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Make thumbnail
                      </button>
                      <button
                        onClick={() => handleDelete(mid)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="col-span-full text-center text-sm text-gray-500 border rounded-xl py-10">
                No media yet. Click <span className="font-medium">Add image</span>.
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-white">
            Close
          </button>
        </div>
      </div>

      {/* The pretty upload popup */}
      <MediaUploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onAdd={handleAddFromDialog}
      />
    </div>
  );
}
