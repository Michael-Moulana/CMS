// frontend/src/pages/dashboard/media/ImageSlot.jsx
import React, { useEffect, useMemo, useState, memo } from "react";

/**
 * ImageSlot handles:
 *  - File previews (object URLs)
 *  - String URLs (from server/external)
 * It is memoized so typing elsewhere doesn't re-render it.
 */
function ImageSlotBase({
  fileOrUrl,
  label = "",
  className = "",
  onClick,
}) {
  const isFile = useMemo(
    () => typeof File !== "undefined" && fileOrUrl instanceof File,
    [fileOrUrl]
  );

  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!isFile) {
      // clean up any previous blob URL when switching away from a File
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl("");
      }
      return;
    }

    const url = URL.createObjectURL(fileOrUrl);
    setBlobUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFile, fileOrUrl]);

  const src = isFile ? blobUrl : (fileOrUrl || "");

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl border border-gray-300 bg-white/80 grid place-items-center overflow-hidden",
        className,
      ].join(" ")}
      aria-label={label || "image slot"}
    >
      {src ? (
        <img
          src={src}
          alt={label || "image"}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="text-gray-400 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 16l5-5 4 4 5-6 4 5" />
          </svg>
        </div>
      )}
    </button>
  );
}

/**
 * Memoize with a custom compare:
 * - If both props are Files, re-render only if it's a different File object.
 * - If both are strings/URLs, re-render only if the string changed.
 * - Ignore function prop identity (onClick), className & label for flicker prevention.
 */
export default memo(ImageSlotBase, (prev, next) => {
  const fileCtor = typeof File !== "undefined" ? File : null;
  const prevIsFile = fileCtor && prev.fileOrUrl instanceof fileCtor;
  const nextIsFile = fileCtor && next.fileOrUrl instanceof fileCtor;

  if (prevIsFile && nextIsFile) {
    return prev.fileOrUrl === next.fileOrUrl;
  }
  if (!prevIsFile && !nextIsFile) {
    return prev.fileOrUrl === next.fileOrUrl
      && prev.className === next.className
      && prev.label === next.label;
  }
  return false; // changed type (File <-> string), must re-render
});