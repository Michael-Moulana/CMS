import { useEffect, useMemo, useState } from "react";

/**
 * Square/rect box that shows either a faint image icon or a real image.
 * - fileOrUrl: File | string | null
 * - rounded: tailwind radius class for the card corners around it (optional)
 * - onClick: open the upload dialog when user clicks the box
 * - icon: optional SVG (fallback is a simple image icon)
 */
export default function ImageSlot({ fileOrUrl, label, onClick, className = "" }) {
  const [objectUrl, setObjectUrl] = useState("");

  // Support File input (from dialog) AND URL (future-proof for edit mode)
  const src = useMemo(() => {
    if (!fileOrUrl) return "";
    if (typeof fileOrUrl === "string") return fileOrUrl;
    return URL.createObjectURL(fileOrUrl);
  }, [fileOrUrl]);

  useEffect(() => {
    if (typeof fileOrUrl === "object" && fileOrUrl) {
      setObjectUrl(src);
      return () => URL.revokeObjectURL(src);
    }
  }, [fileOrUrl, src]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-gray-300 bg-white/70
                  grid place-items-center group ${className}`}
      title={label || "Add image"}
    >
      {/* image preview */}
      {src ? (
        <img
          src={src}
          alt={label || "image"}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mb-1 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="14" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <path d="M21 13l-5-5-4 4-2-2-5 5"/>
          </svg>
          {label && <span className="text-xs opacity-70">{label}</span>}
        </div>
      )}
    </button>
  );
}
