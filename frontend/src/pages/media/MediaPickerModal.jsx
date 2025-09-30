// Single-image edit modal (UI )
import { useEffect, useState } from "react";

export default function MediaPickerModal({
  productId,
  open,
  item,         // { relationId, url, title, order }
  onClose,
}) {
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (!open || !item) return;
    setTitle(item.title ?? "");
    setOrder(Number(item.order ?? 0));
  }, [open, item]);

  if (!open || !item) return null;

  const handleSave = () => {
    //  API to be added in next commit
    console.log("Save clicked (UI only)");
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm grid place-items-center">
      <div className="w-[92vw] max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 pb-0">
          <div className="rounded-xl overflow-hidden border bg-gray-50">
            <div className="w-full h-56 sm:h-64">
              {item.url ? (
                <img
                  src={item.url}
                  alt={title || "media"}
                  className="w-full h-full object-contain bg-white"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-gray-400">
                  No preview
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="rounded-xl border bg-gray-50 p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg bg-white border px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Order</label>
                <input
                  type="number"
                  min={0}
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full rounded-lg bg-white border px-3 py-2"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  0 = big image, 1 &amp; 2 = small images
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center pt-2">
            <button onClick={onClose} className="text-blue-600 underline">
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md"
            >
              update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}