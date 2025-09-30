// frontend/src/pages/media/ImageSlot.jsx
import React, { useEffect, useMemo } from "react";

/**
 * Clickable image slot:
 * - If fileOrUrl present, shows full-bleed preview (cover)
 * - Otherwise shows centered image icon
 * - Absolutely no scrollbars/strips (overflow-hidden)
 */
export default function ImageSlot({
  fileOrUrl,
  onClick,
  className = "",
  ariaLabel = "Select image",
}) {
  const src = useMemo(() => {
    if (!fileOrUrl) return "";
    if (typeof fileOrUrl === "string") return fileOrUrl;     // URL already
    try {
      return URL.createObjectURL(fileOrUrl);                 // File -> blob URL
    } catch {
      return "";
    }
  }, [fileOrUrl]);

  // Clean up blob URL
  useEffect(() => {
    return () => {
      if (src && src.startsWith("blob:")) URL.revokeObjectURL(src);
    };
  }, [src]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "relative w-full rounded-2xl border border-gray-300 bg-white",
        "hover:border-gray-500 transition-colors",
        "overflow-hidden",               // ← kills the left “strip”
        "grid place-items-center",       // centers the icon when empty
        className,
      ].join(" ")}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className="absolute inset-0 w-full h-full object-cover" // full-bleed cover
          draggable={false}
        />
      ) : (
        // placeholder icon
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M21 17l-5.5-5.5a1 1 0 0 0-1.4 0L7 18" />
        </svg>
      )}
    </button>
  );
}