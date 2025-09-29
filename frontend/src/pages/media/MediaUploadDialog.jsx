import { useEffect, useRef, useState } from "react";

export default function MediaUploadDialog({
  open,
  onClose,
  onAdd, // (file) => void
}) {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setDragOver(false);
    }
  }, [open]);

  if (!open) return null;

  const pick = () => inputRef.current?.click();

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) setFile(f);
  };

  const onSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-[420px] md:w-[500px] rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-7">
          {/* dropzone */}
          <div
            className={`rounded-2xl border-2 ${
              dragOver ? "border-blue-400 bg-blue-50/40" : "border-gray-200 bg-gray-50"
            } min-h-[340px] grid place-items-center px-6 transition-colors`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
          >
            <div className="text-center space-y-4 md:space-y-5">
              {/* cloud icon */}
              <svg
                viewBox="0 0 24 24"
                className="mx-auto h-10 w-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 17.5a4.5 4.5 0 0 0-2.5-8.2 6 6 0 0 0-11.6 1.7A4 4 0 0 0 4 17.5h16z" />
                <path d="M12 11v7" />
                <path d="M9.5 14.5L12 12l2.5 2.5" />
              </svg>

              <div className="space-y-1">
                <p className="text-sm md:text-[15px] text-gray-700">
                  Choose a file or drag & drop it here
                </p>
                <p className="text-xs text-gray-400">JPEG formats up to 2 MB</p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={pick}
                  className="inline-flex items-center h-10 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Browse File
                </button>
              </div>

              {file && (
                <div className="text-xs text-gray-500">
                  Selected: <span className="font-medium">{file.name}</span>
                </div>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={onSelect}
            />
          </div>

          {/* actions */}
          <div className="mt-5 flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="text-blue-600 underline text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => file && onAdd?.(file)}
              disabled={!file}
              className="h-10 px-6 rounded-xl bg-blue-600 text-white disabled:opacity-40"
            >
              add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}