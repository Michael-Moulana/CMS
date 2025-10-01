import { useEffect, useRef, useState } from "react";

const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED = ["image/jpeg", "image/png"];

export default function MediaUploadDialog({ open, onClose, onAdd }) {
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const dropRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setErr("");
    }
  }, [open]);

  const validate = (f) => {
    if (!f) return "No file selected";
    if (!ALLOWED.includes(f.type)) return "Only JPEG/PNG allowed";
    if (f.size > MAX_SIZE) return "File must be ≤ 3MB";
    return "";
  };

  const pick = (f) => {
    const msg = validate(f);
    if (msg) {
      setErr(msg);
      return;
    }
    setErr("");
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) pick(f);
  };

  const onBrowse = (e) => {
    const f = e.target.files?.[0];
    if (f) pick(f);
    e.target.value = "";
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] grid place-items-center bg-black/40 backdrop-blur-sm">
      <div className="w-[92vw] max-w-lg rounded-2xl bg-white shadow-xl">
        {/* body */}
        <div className="px-6 pt-6 pb-4">
          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={onDrop}
            className="rounded-2xl border border-gray-200 bg-white/60 px-6 py-10 text-center"
          >
            <div className="mx-auto mb-4 h-10 w-10 rounded-full grid place-items-center text-gray-500">
              {/* cloud icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M7 18a4 4 0 010-8 5 5 0 019.6 1.5A3.5 3.5 0 1117 18H7z" />
              </svg>
            </div>

            <div className="text-sm text-gray-700">Choose a file or drag &amp; drop it here</div>
            <div className="text-xs text-gray-400 mt-1">JPEG formats up to 3 MB</div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-block rounded-xl border border-gray-300 px-4 py-2 text-sm bg-white"
              >
                Browse File
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={onBrowse}
              />
            </div>

            {file && (
              <div className="mt-4 text-xs text-gray-500">
                Selected: <span className="font-medium">{file.name}</span>
              </div>
            )}
            {err && <div className="mt-4 text-sm text-red-600">{err}</div>}
          </div>
        </div>

        {/* footer */}
        <div className="px-6 pb-6 flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="text-blue-600 underline text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { if (file) { onAdd([file]); onClose(); } }}
            disabled={!file}
            className="rounded-xl bg-blue-600 text-white px-5 py-2 text-sm disabled:opacity-50"
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
}
