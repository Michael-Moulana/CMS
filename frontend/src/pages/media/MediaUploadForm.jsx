// frontend/src/pages/media/MediaUploadForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Props
 * - value: FileList | null
 * - onChange: (FileList) => void
 * - max: number (default 3)
 */
export default function MediaUploadForm({ value, onChange, max = 3 }) {
  const inputRef = useRef(null);

  // Convert FileList to array for rendering
  const filesArr = useMemo(() => (value ? Array.from(value) : []), [value]);
  const [previews, setPreviews] = useState([]);

  // Build/revoke preview URLs
  useEffect(() => {
    const urls = filesArr.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [filesArr]);

  const remaining = Math.max(0, max - filesArr.length);

  const openPicker = () => {
    if (!inputRef.current) return;
    inputRef.current.click();
  };

  const handlePick = (e) => {
    const picked = Array.from(e.target.files || []);
    if (picked.length === 0) return;

    // merge with existing (no delete yet)
    const next = [...filesArr, ...picked].slice(0, max);

    // build a new FileList via DataTransfer (so parent still receives FileList)
    const dt = new DataTransfer();
    next.forEach((f) => dt.items.add(f));
    onChange(dt.files);

    // reset input so the same file can be picked again later if needed
    e.target.value = "";
  };

  return (
    <div>
      {/* helper line like Figma */}
      <p className="text-sm text-gray-600 mb-4">
        You can attach images now and they’ll be created with the product.
      </p>

      {/* inline tiles + add button */}
      <div className="flex items-center gap-4">
        {/* existing previews first */}
        {previews.map((src, i) => (
          <div
            key={`prev-${i}`}
            className="h-14 w-24 rounded-xl border border-gray-200 overflow-hidden bg-white/70 grid place-items-center"
          >
            <img src={src} alt={`preview-${i}`} className="h-full w-full object-cover" />
          </div>
        ))}

        {/* ghost slots to show up to 3 total (no image yet) */}
        {Array.from({ length: remaining }).map((_, i) => (
          <div
            key={`ghost-${i}`}
            className="h-14 w-24 rounded-xl border border-dashed border-gray-300 bg-white/50 grid place-items-center"
          >
            {/* picture icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.75" />
              <path d="M21 15l-4.5-4.5L9 18" />
            </svg>
          </div>
        ))}

        {/* blue + button */}
        {filesArr.length < max && (
          <button
            type="button"
            onClick={openPicker}
            className="h-10 w-10 rounded-full bg-blue-600 text-white grid place-items-center hover:bg-blue-700"
            title="Add image"
            aria-label="Add image"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        )}

      </div>

      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        onChange={handlePick}
        className="hidden"
      />
    </div>
  );
}
