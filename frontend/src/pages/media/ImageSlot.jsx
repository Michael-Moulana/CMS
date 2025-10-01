// frontend/src/pages/media/ImageSlot.jsx
export default function ImageSlot({ fileOrUrl, label, onClick, className = "" }) {
  let src = "";

  // Handle File objects (local uploads)
  if (fileOrUrl instanceof File) {
    src = URL.createObjectURL(fileOrUrl);
  }
  // Handle plain URL strings
  else if (typeof fileOrUrl === "string") {
    src = fileOrUrl;
  }

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl border border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer ${className}`}
    >
      {src ? (
        <img src={src} alt={label || "image"} className="w-full h-full object-cover" />
      ) : (
        <div className="text-gray-400 flex flex-col items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4-4 4 4m0 0l4-4 4 4M4 20h16"
            />
          </svg>
          <span className="text-xs">Click to select</span>
        </div>
      )}
    </div>
  );
}
