import React, { useEffect, useMemo, useState } from "react";

/**
 * ImageSlot handles both:
 *  - File previews (using object URLs)
 *  - String URLs (from server or external)
 */
export default function ImageSlot({
  fileOrUrl,
  label = "",
  className = "",
  onClick,
}) {
  const isFile = useMemo(
    () => typeof File !== "undefined" && fileOrUrl instanceof File,
    [fileOrUrl]
  );

  // local state for object URL if the input is a File
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!isFile) {
      // clean up any previous blob URL when switching away from File
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl("");
      }
      return;
    }

    // create a stable object URL for this File
    const url = URL.createObjectURL(fileOrUrl);
    setBlobUrl(url);

    // revoke only on unmount or when file changes
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
        // keep your original placeholder icon, no "Upload / Pick" text
        <div className="text-gray-400 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 16l5-5 4 4 5-6 4 5" />
          </svg>
        </div>
      )}
    </button>
  );
}